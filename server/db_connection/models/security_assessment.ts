
//An interface for the security_assessment

export interface SecurityAssessment {
    public_key:  string,
    metric_version: number,
    timestamp?: Date,
    score: number 
}