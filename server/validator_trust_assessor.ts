import axios from 'axios';
import Logger from './logger';
import { Validator } from './validators';
import { ValidatorStatistics } from './validator_monitor';
import { getValidatorsStatistics, insertValidatorsAssessments } from './db_connection/db_helper';
import ValidatorAssessment from "./db_connection/models/validator_assessment";
import { calculateEMA } from './calculate_metrics';

// this is the format of the validator json object returned from Ripple's API
interface ValidatorResponse {
    validation_public_key: string,
    //master_key: null,
    domain: string,                                                                              // can be null
    chain: 'main',
    agreement_1h: { missed: number, total: number, score: string, incomplete: boolean },         // can be null
    //agreement_24h: null,
    //agreement_30day: null,
    unl: boolean | string,
}

// validator statistics grouped by public key
// so for every node `total` and `missed` will contain an array
// of numbers containing all information in the database
// TODO make it only take the data from the last month
export interface ValidatorStatisticsTotal {
    public_key: string,
    total: number[],
    missed: number[]
}

// A class that computes the trust metric for the validator nodes
export default class ValidatorTrustAssessor {

    // how often a trust score has to be computed in minutes
    readonly calculation_interval: number;

    constructor(calculation_interval = 61) {
        this.calculation_interval = calculation_interval;
    }

    // run the validator trust metric assessor
    // once indicates whether to run it once or (if false or not set) to schedule it every calculation_interval minutes
    run() {
        Logger.info("Starting the Validator nodes Trust Assessor.");
        // fetch the data for the validators
        getValidatorsStatistics().then((validators: ValidatorStatisticsTotal[]) => {
            this.assessScores(validators).then((assessments: ValidatorAssessment[]) => {
                // assessments should be defined and cannot be empty
                if (assessments !== undefined && assessments.length !== 0) {
                    insertValidatorsAssessments(assessments).then(() => {
                        Logger.info("Valildator nodes trust assessment successfully stored in the database.");
                    }).catch(err => {
                        Logger.error(`The Validator nodes Trust Assessor could not save the assessments in the database: ${err}`);
                    });
                } else {
                    Logger.info("There are no assessments that can be saved to the database.");
                }
            }).catch(err => {
                Logger.error(`The Validator nodes Trust Assessor could not calculate the trust score for all nodes: ${err}`);
            });
        }).catch(err => {
            Logger.error(`The Validator nodes Trust Assessor could not get the validators' statistics from the database: ${err}`);
        })

    }

    assessScores(validators: ValidatorStatisticsTotal[]): Promise<ValidatorAssessment[]> {
        return Promise.all(validators.map((validator: ValidatorStatisticsTotal) => {
            return this.assessScore(validator);
        }));
    }

    assessScore(validator: ValidatorStatisticsTotal): Promise<ValidatorAssessment> {
        return new Promise((resolve, reject) => {
            if (validator.missed.length !== validator.total.length) {
                Logger.error(`One or more ${validator.missed.length > validator.total.length ? "total" : "missed" } ledger hourly statistics for validator with public_key = ${validator.public_key} are missing.`);
                resolve( <ValidatorAssessment> {
                    public_key: validator.public_key
                });
            }
            var scores = validator.missed.map((missed, index) => {
                if (validator.total[index] === 0)
                    return 0;
                return (1 - (missed / validator.total[index]));
            });
            // because of the way the hourly statistics are computed, there will always be some prepended zeroes
            // that are added when the validator monitor is first started
            // these zeroes have to be removed from the score


            // get index of first non-zero hourly score
            let index = 0;
            for (var i = 0; i < scores.length; i++) {
                if (scores[i] === 0)
                    continue;
                index = i;
                break;
            }
            // remove the first n zeroes from the daily/hourly scores
            scores = scores.slice(index)

            // calculate the score and return it
            const score = calculateEMA(scores);
            resolve({
                public_key: validator.public_key,
                trust_metric_version: 1.0,
                score: score
            });
        });
    }

}
