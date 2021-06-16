export default interface ValidatorAssessment {
    public_key:  string,
    trust_metric_version: number,
    timestamp?: Date,
    score: number 
}
