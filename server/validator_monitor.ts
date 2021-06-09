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
    readonly INTERVAL: number = 0.2;

    readonly validatedLedgers = new Map<string, Set<string>>();        // map format: validator_hash:<set of ledgers that it approved>
    canonicalLedgers: string[] = []
    readonly canonicalLedgersTotal: string[] = [];

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
                this.canonicalLedgers.push(event.ledger_hash);
                this.canonicalLedgersTotal.push(event.ledger_hash);
            })

            api.connection.on('validationReceived', (event: any) => {
                if (this.validatedLedgers.get(event.master_key)) {
                    this.validatedLedgers.get(event.master_key)?.add(event.ledger_hash);
                } else {
                    this.validatedLedgers.set(event.master_key, new Set([event.ledger_hash]))
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
        // TODO only validators public keys are needed
        // TODO encode the public keys of the validator nodes to base58 before adding them to the database
        getValidators().then(validators => {
            const validator_statistics = validators.map(validator => {
                const total = this.canonicalLedgers.length;
                // for the `missed` ledgers, we need to calculate the difference between the validated ledgers for a given validator public key (validatedLedgers.get(validator.public_key))
                //  and the canonical ledgers.
                //  The difference should include both canonical ledgers that were not approved by a given validator, AND approved ledgers that are not canonical.
                const validatedLedgers = this.validatedLedgers.get(validator.public_key);
                let missed = total;


                if (validatedLedgers !== undefined) {
                    const validatedLedgersArray = Array.from(validatedLedgers);
                    missed = validatedLedgersArray.filter(l => !this.canonicalLedgers.includes(l) && !this.canonicalLedgersTotal.includes(l))
                        .concat(this.canonicalLedgers.filter(l => !validatedLedgersArray.includes(l) )).length;
                }

                return <ValidatorStatistics> {
                    public_key: validator.public_key,
                    total: total,
                    missed: missed
                }
            })

            // clear the cached ledgers
            this.validatedLedgers.clear();
            this.canonicalLedgers = [];

            // now insert the statistics in the database
            insertValidatorsStatistics(validator_statistics)
                .catch((err: Error) => {
                    Logger.error(`Cannot insert the computed validators statistics to the database: ${err}`);
                })
                .finally(() => {

                    // clear the cached ledgers
                    //this.validatedLedgers.clear();
                    //this.canonicalLedgers = [];

                    // schedule the same procedure again after `INTERVAL` minutes
                    this.schedule();
                });

        }).catch((err: Error) => {
            Logger.error(`Could not get the validator public keys from the database: ${err}`)
        });


    }
}
