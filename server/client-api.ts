
import { Express, Response } from 'express'
import { calculateEMA, calculateSMA } from './calculate_metrics';
import { ERROR_DATABASE_QUERY, ERROR_KEY_NOT_FOUND } from './config/messages';
import { getAllNodes, getHistoricalData, getNode, getNodeOutgoingPeers, getValidatorHistoricalData } from './db_connection/db_helper';
import Logger from './logger';


export var LAST_CRAWL: number = Date.now();
export var LAST_SEC_SCAN: number = Date.now();
export var LAST_TRUST_SCAN: number = Date.now();

/*
    This file exports a function which takes an Express object
and adds a couple of endpoints to it. These are the endpoints
meant for use by the Web Client of the application.

*/

/**
 * Checks whether a public_key has been passed as a parameter
 * If not, sends an error over the response and returns false
 * Otherwise, returns true
 * @param key - the public_key obtained from the request
 * @param res - the response over which to send in case key is not present
 * @returns - boolean
 */
function is_key_present(key: String, res: Response): boolean {
    if (key) {
        return true;
    }
    Logger.error(ERROR_KEY_NOT_FOUND);
    res.status(400).send(ERROR_KEY_NOT_FOUND);
    return false;
}

export default function setupClientAPIEndpoints(app: Express) {

    app.get('/last-modifications', (req, res) => {

        Logger.info("Received request for checking the last modification timestamps.");
        res.send(JSON.stringify({
            LAST_CRAWL: LAST_CRAWL,
            LAST_SEC_SCAN: LAST_SEC_SCAN,
            LAST_TRUST_SCAN: LAST_TRUST_SCAN
        }));

    });

    app.get('/node/get-all-nodes', (req, res) => {
        Logger.info("Received request for all nodes' geographic coordinates and basic data.");
        getAllNodes().then((nodes) => {
            res.send(JSON.stringify(nodes));
        }).catch((err: Error) => {
            Logger.error(err.message);
            res.status(400).send(err.message);
        });
    });

    app.get('/node/score-peers', (req, res) => {
        Logger.info("Received request for the security assessment score and peer connections of a node.");
    });

    app.get('/node/score', (req, res) => {
        Logger.info("Received request for the security assessment score of a node.");

        let public_key: String = String(req.query.public_key);
        if (is_key_present(public_key, res)) {
            getHistoricalData(public_key, 30).then((result) => {
                res.send(calculateSMA(result) + " " + calculateEMA(result));
            }).catch((err: Error) => {
                Logger.error(err.message);
                res.status(400).send(err.message);
            });
        }
    });

    app.get('/node/peers', (req, res) => {
        Logger.info('Received request for the peer connections of a node.');

        let public_key: string = String(req.query.public_key);

        if (is_key_present(public_key, res)) {
            getNodeOutgoingPeers(public_key).then((results) => {
                res.send(JSON.stringify(results));
            }).catch((err: Error) => {
                Logger.error(err.message);
                res.status(400).send(err.message);
            });
        }
    });

    app.get('/node/history', (req, res) => {
        Logger.info('Received request for the history of security analysis of a node.');

        const public_key: String = String(req.query.public_key);
        if (is_key_present(public_key, res)) {
            const duration: number = req.query.duration ? Number(req.query.duration) : 30;

            getHistoricalData(public_key, duration).then((result) => {
                res.send(JSON.stringify(result));
            }).catch((err: Error) => {
                Logger.error(err.message);
                res.status(400).send(err.message);
            });
        }

    });

    app.get('/validator/history', (req, res) => {
        Logger.info('Received request for the history of trust analysis of a validator.');

        const public_key: string = String(req.query.public_key);
        if (is_key_present(public_key, res)) {
            const duration: number = req.query.duration ? Number(req.query.duration) : 30;

            getValidatorHistoricalData(public_key, duration).then((results) => {
                res.send(JSON.stringify(results));
            }).catch((err: Error) => {
                Logger.error(err.message);
                res.status(400).send(err.message);
            });
        }
    });

    app.get('/node/info', (req, res) => {
        Logger.info('Received request for information of a node.');

        const public_key: string = String(req.query.public_key);
        if (is_key_present(public_key, res)) {
            getNode(public_key).then((results) => {
                res.send(JSON.stringify(results));
            }).catch((err: Error) => {
                Logger.error(err.message);
                res.status(400).send(err.message);
            });
        }
    });
}