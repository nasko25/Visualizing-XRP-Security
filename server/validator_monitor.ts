'use strict';
import { EventEmitter } from 'events';
import { getValidators, insertValidatorsStatistics } from './db_connection/db_helper';
import Logger from './logger';
import config from './config/config.json';
const RippleAPI = require('ripple-lib').RippleAPI;

const monitor_node = 'wss://ripple5.ewi.tudelft.nl'
const ripple1_node = 'wss://s1.ripple.com'
const ripple2_node = 'wss://s2.ripple.com'
//const ripple3_node = 'wss://xrpl.ws/'
const ripple3_node = config.validators_api_endpoint;
//const ripple3_node = 'wss://s.devnet.rippletest.net';
const ripple1_hash = "nHUPAdpS7GdfeisdtHE5YiSUcUJ8VhtHP2o4yWNQcsXfE89WKHMN"
const ripple2_hash = "nHUZoRNnFqxiLrXyydtLapFJxZMUxgTuGg9624Pdg4med73xNSP2"


export interface ValidatorStatistics {
    public_key: string,
    total: number,
    missed: number
}

export class ValidatorMonitor {
    // event emitter passed from app.ts that will be used to fire an event
    // to notify the ValidatorTrustAssessor that it can recalculate the trust score of the validators
    // (since the information in the database will have been updated)
    readonly eventEmitter: EventEmitter;

    // how often the information gathered from the ValidatorMonitor should be used to
    //  update the database (in minutes)
    //  NOTE: if this variable needs to be adjusted, check the variables in this.run() as well,
    //  because they will probably also need to be updated
    readonly INTERVAL: number = 60;

    readonly validatedLedgers = new Map<string, Map<string, number>>();        // map format: validator_hash:{ <set of ledgers that it approved>, <date when the data was acquired>
    canonicalLedgers: { ledger_hash: string, timestamp: number }[] = [];

    constructor(eventEmitter: EventEmitter) {
        this.eventEmitter = eventEmitter;
        this.subsribeToAPI();
        this.schedule();
    }

    async subsribeToAPI() {

        const api = new RippleAPI({
          server: ripple3_node
        });

        api.on('error', (errorCode: string, errorMessage: string) => {
            Logger.error(errorCode + ': ' + errorMessage);
        });

        api.on('connected', () => {
            Logger.info(`Connected to the ${config.validators_api_endpoint} Ripple node to listen for validated ledgers.`);
        });

        api.on('disconnected', (code: number) => {
            if (code !== 1000) {
                Logger.info(`Disconnected from the Ripple node with error code: ${code}`);
            } else {
                Logger.info('Disconnected from the Ripple node normally.');
            }
        });

        api.connect().then(() => {
            api.connection.on('ledgerClosed', (event: any) => {
                //console.log("Canonical ledger is", event.ledger_hash)
                this.canonicalLedgers.push({ ledger_hash: event.ledger_hash, timestamp: Date.now() });
            })

            api.connection.on('validationReceived', (event: any) => {
                if (this.validatedLedgers.get(event.master_key)) {
                    this.validatedLedgers.get(event.master_key)?.set(event.ledger_hash, Date.now());
                } else {
                    this.validatedLedgers.set(event.master_key, new Map([ [event.ledger_hash, Date.now()] ]))
                }

                //if (event.master_key === ripple1_hash) {
                //    //validated_ledgers.push(event.ledger_hash)
                //    console.log("Ripple1: Validation of ledger", event.ledger_hash, "by node", ripple1_hash)
                //}

                //if (event.master_key === ripple2_hash) {
                //    //validated_ledgers.push(event.ledger_hash)
                //    console.log("Ripple2: Validation of ledger", event.ledger_hash, "by node", ripple2_hash)
                //}
            })

            api.request('subscribe', {
              streams: ['ledger', 'validations']
            }).then(() => {
                Logger.info(`Successfully subscribed to the ${config.validators_api_endpoint} Ripple node's ledger and validations strams.`);
            }).catch((error: Error) => {
                Logger.error(error);
            })
          }).catch((error: Error) => {
            Logger.error(error);
          });

    }

    schedule() {
        Logger.info(`Scheduling a validator trust assessment after ${this.INTERVAL} minutes.`);
        setTimeout(() => { this.run() }, this.INTERVAL * 1000 * 60);
    }

    // clear the cached information every `INTERVAL` minutes and fire an event for the ValidatorTrustAssessor to recalculate
    //  the nodes' scores
    run() {
        // the interval between `twoMinsAgo` and `oneHrsAgo` represents the interval we are looking at to calculate missed and total ledgers for each validator
        // since some `ledgerClosed` and `validationReceived` messages can come a bit later, the tool gives them 2 minutes to arrive
        // so the information below is calculated with a 2 minute delay
        const twoMinsAgo = Date.now() - (2 * 60 * 1000);
        const oneHrsAgo = Date.now() - (62 * 60 * 1000);

        // everything before `twoHrsAgo` will be deleted from memory
        const twoHrsAgo = Date.now() - (2 * 60 * 60 * 1000);
        const canonicalLedgers = this.canonicalLedgers.filter(ledger => ledger.timestamp < twoMinsAgo && ledger.timestamp > oneHrsAgo).map(ledger => ledger.ledger_hash);
        this.canonicalLedgers = this.canonicalLedgers.filter(ledger => ledger.timestamp >= twoHrsAgo);
        const total = canonicalLedgers.length;
        // TODO only validators public keys are needed
        getValidators().then(validators => {
            const validator_statistics = validators.map(validator => {
                // for the `missed` ledgers, we need to calculate the difference between the validated ledgers for a given validator public key (validatedLedgers.get(validator.public_key))
                //  and the canonical ledgers.
                //  The difference should include both canonical ledgers that were not approved by a given validator, AND approved ledgers that are not canonical.
                const validatedLedgers: string[] = [];
                //let missed = total;

                if (this.validatedLedgers.has(validator.public_key)) {
                    this.validatedLedgers.get(validator.public_key)
                        ?.forEach((value, key, map) => {
                            if (value < twoMinsAgo && value > oneHrsAgo) {
                                validatedLedgers.push(key);
                            }
                            if (value <= twoHrsAgo) {
                                map.delete(key);
                                if (map.size === 0) this.validatedLedgers.delete(validator.public_key);
                            }
                        });
                }
                // TODO add a field in the validator assessment table that indicates validators that validate on mainnet
                const missed = validatedLedgers.filter(l => !canonicalLedgers.includes(l) && (this.canonicalLedgers.filter(ledger => ledger.ledger_hash === l).length === 0))
                    .concat(canonicalLedgers.filter(l => !validatedLedgers.includes(l) && (this.validatedLedgers.has(validator.public_key) ? !this.validatedLedgers.get(validator.public_key)?.has(l) : true ) )).length;

                return <ValidatorStatistics> {
                    public_key: validator.public_key,
                    total: total,
                    missed: missed
                };
            })

            // clear the cached ledgers
            //this.validatedLedgers.clear();
            //this.canonicalLedgers = [];

            // now insert the statistics in the database (if there are any to be inserted)
            if (validator_statistics.length !== 0) {
                insertValidatorsStatistics(validator_statistics)
                    .catch((err: Error) => {
                        Logger.error(`Cannot insert the computed validators statistics to the database: ${err}`);
                    });
            }

        }).catch((err: Error) => {
            Logger.error(`Could not get the validator public keys from the database: ${err}`)
        }).finally(() => {
            // clear the cached ledgers
            //this.validatedLedgers.clear();
            //this.canonicalLedgers = [];

            this.eventEmitter.emit("validationMonitoringDone");
            // schedule the same procedure again after `INTERVAL` minutes
            this.schedule();
        });

    }
}
