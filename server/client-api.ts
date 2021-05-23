
import {Express} from 'express'
import { calculateEMA, calculateSMA } from './calculate_metrics';
import { ERROR_DATABASE_QUERY, ERROR_KEY_NOT_FOUND } from './config/messages';
import { getAllNodes, getHistoricalData, getNodeOutgoingPeers, getValidatorHistoricalData } from './db_connection/db_helper';
import Logger from './logger';


export var LAST_CRAWL: number = Date.now();
export var LAST_SEC_SCAN: number = Date.now();
export var LAST_TRUST_SCAN: number = Date.now();

/*
    This file exports a function which takes an Express object
and adds a couple of endpoints to it. These are the endpoints
meant for use by the Web Client of the application.

*/

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
        var nodes = getAllNodes(function (result): void {
            res.send(JSON.stringify(result));
        });
    });
    
    app.get('/node/score-peers', (req, res) => {
        Logger.info("Received request for the security assessment score and peer connections of a node.");
    });
    
    app.get('/node/score', (req, res) => {
        var pub_key = req.query;
        var public_key: String = String(req.query.public_key);
        getHistoricalData(function (result): void{
            res.send(calculateSMA(result) + " " +  calculateEMA(result));
        }, public_key, 30);
        Logger.info("Received request for the security assessment score of a node.");
    });
    
    app.get('/node/peers', (req, res) => {
        Logger.info('Received request for the peer connections of a node.');
        let public_key: string = String(req.query.public_key);
        if (public_key === null) {
            Logger.error(ERROR_KEY_NOT_FOUND);
            res.status(400).send(ERROR_KEY_NOT_FOUND);
        } else {
            getNodeOutgoingPeers(public_key, (err, results) => {
                if (err) {
                    let error_string: string = `${ERROR_DATABASE_QUERY} : ${err.message}`;
                    Logger.error(error_string);
                    res.status(400).send(error_string);
                }
                else res.send(JSON.stringify(results));
            });
    
        }
    });
    
    app.get('/node/history', (req, res) => {
        Logger.info('Received request for the history of security analysis of a node.');

        const public_key: String = String(req.query.public_key);
        if (public_key === null) {
            Logger.error(ERROR_KEY_NOT_FOUND);
            res.status(400).send(ERROR_KEY_NOT_FOUND);
        }
        else {
            const duration: number = req.query.duration ?  Number(req.query.duration) : 30;

            getHistoricalData(function (result): void{
                res.send(JSON.stringify(result));
            }, public_key, duration);
        }

    });

    app.get('/validator/history', (req, res) => {
        Logger.info('Received request for the history of trust analysis of a validator.');

        const public_key: string = String(req.query.public_key);
        if (public_key === null) {
            Logger.error(ERROR_KEY_NOT_FOUND);
            res.status(400).send(ERROR_KEY_NOT_FOUND);
        }
        else {
            const duration: number = req.query.duration ?  Number(req.query.duration) : 30;
            getValidatorHistoricalData(public_key, duration, (err, results) => {
                if (err) {
                    let error_string: string = `${ERROR_DATABASE_QUERY} : ${err.message}`;
                    Logger.error(error_string);
                    res.status(400).send(error_string);
                }
                else res.send(JSON.stringify(results));
            });
        }

    });
    

}