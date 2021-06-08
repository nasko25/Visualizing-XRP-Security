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
const ripple1_hash = "nHUPAdpS7GdfeisdtHE5YiSUcUJ8VhtHP2o4yWNQcsXfE89WKHMN"
const ripple2_hash = "nHUZoRNnFqxiLrXyydtLapFJxZMUxgTuGg9624Pdg4med73xNSP2"



//const api = new RippleAPI({
//  server: ripple3_node
//});
//
//api.on('error', (errorCode, errorMessage) => {
//    console.log(errorCode + ': ' + errorMessage);
//});
//
//api.on('connected', () => {
//    console.log('Connected to Ripple node');
//});
//
//api.on('disconnected', (code) => {
//    console.log('disconnected, code:', code);
//});
//
//api.connect().then(() => {
//    api.connection.on('ledgerClosed', (event) => {
//        //canonical_ledgers.push(event.ledger_hash)
//        console.log("Canonical ledger is", event.ledger_hash)
//    })
//
//    api.connection.on('validationReceived', (event) => {
//        if (validated_ledgers.get(master_key)) {
//            validated_ledgers.get(event.master_key).push(event.ledger_hash);
//        } else {
//            validated_ledgers.set(event.master_key, [event.ledger_hash])
//        }
//
//        //if (event.master_key === ripple1_hash) {
//        //    //validated_ledgers.push(event.ledger_hash)
//        //    console.log("Ripple1: Validation of ledger", event.ledger_hash, "by node", ripple1_hash)
//        //}
//
//        //if (event.master_key === ripple2_hash) {
//        //    //validated_ledgers.push(event.ledger_hash)
//        //    console.log("Ripple2: Validation of ledger", event.ledger_hash, "by node", ripple2_hash)
//        //}
//    })
//
//    api.request('subscribe', {
//      streams: ['ledger', 'validations']
//    }).then(response => {
//        console.log('Successfully subscribed')
//    }).catch(error => {
//        console.error(error)
//    })
//  }).catch(console.error);


export interface ValidatorStatistics {
    public_key: string,
    total: number,
    missed: number
}

class ValidatorMonitor {
    // event emitter passed from app.ts that will be used to fire an event
    // to notify the ValidatorTrustAssessor that it can recalculate the trust score of the validators
    // (since the information in the database will have been updated)
    readonly eventEmitter: EventEmitter;

    // how often the information gathered from the ValidatorMonitor should be used to
    //  update the database (in minutes)
    readonly INTERVAL: number = 61;

    readonly validatedLedgers = new Map<string, string[]>();        // map format: validator_hash:<list of ledgers that it approved>
    canonicalLedgers: string[] = []

    constructor(eventEmitter: EventEmitter) {
        this.eventEmitter = eventEmitter;
        this.subsribeToAPI();
    }

    async subsribeToAPI() {
    }

    schedule() {
        Logger.info(`Scheduling a validator trust assessment after ${this.INTERVAL} minutes.`);
        setTimeout(this.run, this.INTERVAL * 1000 * 60);
    }

    // clear the cached information every `INTERVAL` minutes and fire an event for the ValidatorTrustAssessor to recalculate
    //  the nodes' scores
    run() {
        // TODO only validators public keys are needed
        getValidators().then(validators => {
            const validator_statistics = validators.map(validator => {
                const total = this.canonicalLedgers.length;
                // for the `missed` ledgers, we need to calculate the difference between the validated ledgers for a given validator public key (validatedLedgers.get(validator.public_key))
                //  and the canonical ledgers.
                //  The difference should include both canonical ledgers that were not approved by a given validator, AND approved ledgers that are not canonical.
                const validatedLedgers = this.validatedLedgers.get(validator.public_key);
                let missed = total;

                if (validatedLedgers !== undefined) {
                    missed = validatedLedgers.filter(l => !this.canonicalLedgers.includes(l))
                        .concat(this.canonicalLedgers.filter(l => !validatedLedgers.includes(l) )).length;

                }

                return <ValidatorStatistics> {
                    public_key: validator.public_key,
                    total: total,
                    missed: missed
                }
            })

            // now insert the statistics in the database
            insertValidatorsStatistics(validator_statistics).finally(() => {

                // clear the cached ledgers
                this.validatedLedgers.clear();
                this.canonicalLedgers = [];

                // schedule the same procedure again after `INTERVAL` minutes
                this.schedule();

            });

        });


    }
}
