import axios from 'axios';
import config from './config/config.json';
import Logger from './logger';
import { Validator } from './validators';
import { getValidators, insertValidatorsAssessments } from './db_connection/db_helper';
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

// A class that computes the trust metric for the validator nodes
export default class ValidatorTrustAssessor {

    // how often a trust score has to be computed in minutes
    readonly calculation_interval: number;

    constructor(calculation_interval = 61) {
        this.calculation_interval = calculation_interval;
    }

    // run the validator trust metric assessor
    // once indicates whether to run it once or (if false or not set) to schedule it every calculation_interval minutes
    run(once?: boolean) {
        Logger.info("Starting the Validator nodes Trust Assessor.");
        // fetch the data for the validators
        this.fetchValidatorStatistics().then((response) => {
            const validators = response.data.validators;
            this.assessScores(validators).then((assessments: ValidatorAssessment[]) => {
                insertValidatorsAssessments(assessments).then(() => {
                    Logger.info("Valildator nodes trust assessment successfully stored in the database.");
                }).catch(err => {
                    Logger.error(`The Validator nodes Trust Assessor could not save the assessments in the database: ${err}`);
                })
            })
        }).catch(err => {
            Logger.error(`The Validator nodes Trust Assessor could not calculate the trust score for all nodes: ${err}`);
        })
        .finally(() => this.schedule(once));
    }

    schedule(once?: boolean) {
        if (!once) {
            Logger.info(`Scheduling a validator trust assessment after ${this.calculation_interval} minutes.`);
            setTimeout(this.run, this.calculation_interval * 1000 * 60);
        }
    }

    assessScores(validators: ValidatorResponse[]): Promise<ValidatorAssessment[]> {
        return Promise.all(validators.map((validator: ValidatorResponse) => {
            console.log(validator);
            return this.assessScore(validator);
        }));
    }

    assessScore(validator: ValidatorResponse): Promise<ValidatorAssessment> {
        return new Promise(() => {
            return {
                public_key: "",
                trust_metric_version: 0,
                score: 0
            };
        });
    }

    fetchValidatorStatistics() {
        return axios.get(config.validators_api_endpoint);
    }
}
