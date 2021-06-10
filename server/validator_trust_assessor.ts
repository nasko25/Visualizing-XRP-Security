import axios from 'axios';
import Logger from './logger';
import { Validator } from './validators';
import { ValidatorStatistics } from './validator_monitor';
import { getValidatorsStatistics, insertValidatorsAssessments } from './db_connection/db_helper';
import ValidatorAssessment from "./db_connection/models/validator_assessment";

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
            });
        }).catch(err => {
            Logger.error(`The Validator nodes Trust Assessor could not calculate the trust score for all nodes: ${err}`);
        })

    }

    assessScores(validators: ValidatorStatisticsTotal[]): Promise<ValidatorAssessment[]> {
        return Promise.all(validators.map((validator: ValidatorStatisticsTotal) => {
            return this.assessScore(validator);
        }));
    }

    assessScore(validator: ValidatorStatisticsTotal): Promise<ValidatorAssessment> {
        console.log(validator);
        return new Promise(() => {
            return {
                public_key: "",
                trust_metric_version: 0,
                score: 0
            };
        });
    }

}
