import { SecurityAssessment } from "./db_connection/models/security_assessment";

//Simple moving average
//Each of the last N days has the same weight
export function calculateSMA(scores: SecurityAssessment[]): number{

    var sum: number = 0;
    scores.forEach((x: SecurityAssessment) => {
        sum += x.score;
    });
    console.log("bruh");
    return sum/scores.length;

}

//Exponential moving average
//More recent days have higher weight
export function calculateEMA(scores: SecurityAssessment[]): number{

    var ema: number = 0;
    var multiplier: number = 2 / (scores.length);
    if(scores.length == 0){
        return 0;
    }
    return multiplier * scores[0].score + (1 - multiplier) * calculateEMA(scores.slice(1, scores.length));
}