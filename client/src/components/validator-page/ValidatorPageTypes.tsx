import { HistoricalScore  } from "../node-page/NodePageTypes"
import { History } from 'history';

/**
 * Props passed to ValidatorPageMain
 */
export type ValidatorPageMainProps = {
    history: History;
}

/**
 * Information for a selected validator
 */
export type ValidatorInfo = {
    public_key: string,
    score: number,
    history: HistoricalScore[]
}

/**
 * Information received by server
 */
export type Validator = {
    history: ValidatorHistory[],
    public_key: string,
    score: string,
    timestamp: string
}

/**
 * Validator history
 */
export type ValidatorHistory = {
    timestamp: string,
    score: number
}

/**
 * ValidatorPageMain state
 */
export type ValidatorPageMainStats = {
    data: Validator[],
    info: ValidatorInfo,
    selected: string
}