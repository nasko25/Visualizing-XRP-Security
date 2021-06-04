import Logger from './logger';
import { Validator } from './validators';
import { getValidators, insertValidatorsAssessments } from './db_connection/db_helper';
import ValidatorAssessment from "./db_connection/models/validator_assessment";

// A class that computes the trust metric for the validator nodes
class ValidatorTrustAssessor {

    // how often a trust score has to be computed
    readonly calculation_interval: number = 5;

    constructor(calculation_interval: number) {
        this.calculation_interval = calculation_interval;
    }

    // run the validator trust metric assessor
    // once indicates whether to run it once or (if false or not set) to schedule it every calculation_interval minutes
    run(once?: boolean) {
        Logger.info("Starting the Validator nodes Trust Assessor.");
        getValidators().then((validators: Validator[]) => {
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

    assessScores(validators: Validator[]): Promise<ValidatorAssessment[]> {
        return new Promise(() => validators.map((validator: Validator) => {
            return this.assessScore(validator)
        }));
    }

    assessScore(validator: Validator): ValidatorAssessment {
        return {
            public_key: "",
            trust_metric_version: 0,
            score: 0
        };
    }
}
