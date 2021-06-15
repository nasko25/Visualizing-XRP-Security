
import { Express, Response } from 'express'
import { calculateEMA, calculateSMA } from './calculate_metrics';
import { ERROR_DATABASE_QUERY, ERROR_KEY_NOT_FOUND } from './config/messages';
import { getAllNodes, getHistoricalData, getNode, getNodeOutgoingPeers, getValidatorHistoricalData } from './db_connection/db_helper';
import Logger from './logger';
import { Node } from "./db_connection/models/node";
import { Connection } from './db_connection/models/connection';
import { Mutex } from 'async-mutex';
export var LAST_CRAWL: number = Date.now();
export var LAST_SEC_SCAN: number = Date.now();
export var LAST_TRUST_SCAN: number = Date.now();

//Controls when does the cache expire:
const MINUTES_BEFORE_CACHE_EXPIRES: number = 1;

/*
    This file exports a function which takes an Express object
and adds a couple of endpoints to it. These are the endpoints
meant for use by the Web Client of the application.

*/
interface PeerList {
    peers: Connection[];
    timestamp: Date;
}

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

    // A mutex used when the cache is being updated
    const mutex = new Mutex();

    // A timestamp to track when the cache has to be updated if its information is requested
    var cacheExpiry: Date = new Date();
    var latestVersion: string = "rippled-1.7.0"
    // The cache objects: For requests for all nodes | peers of a node | information about a node
    var nodeCacheAll: Node[] = [];
    var peerCache: Map<string, Connection[]> = new Map();
    var nodeCache: Map<string, Node> = new Map();
   
    // A function that independently updates the cache periodically once per a longer period
    // async function cacheUpdater() {
    //     updateCache().then(() => setTimeout(cacheUpdater, MINUTES_BEFORE_CACHE_EXPIRES * 60 * 1000));
    // }


    // Initialization of the cache
    // cacheUpdater();


    updateCache();
    process.on('message', (data) => {
        if (data && data.toString().includes( 'rippled-')) {
            latestVersion=data.toString();
            updateCache();
        }
    })
 
    async function updateCache() {
        if(mutex.isLocked()) return;
        mutex.acquire().then(async (release) => {
            if (true) {

                peerCache.clear();
                Logger.info("Cache expired, updating");
                // update the expiration timestamp
                cacheExpiry.setMinutes(cacheExpiry.getMinutes() + 2 * MINUTES_BEFORE_CACHE_EXPIRES);

                getAllNodes().then((result) => {
                    nodeCacheAll = result;
                    var interm = new Map<string, Node>();

                    for (var index in result) {
                        interm.set(result[index].public_key, result[index]);
                    }
                    nodeCache.clear();
                    nodeCache = interm;

                }).catch((err: Error) => {
                    Logger.error(err.message);
                    //res.status(400).send(err.message);
                });

                // //DEBUG:
                // var result = [{IP: "4242", rippled_version: "22", public_key: "aa", uptime: cacheExpiry.getMinutes()}];
                // nodeCacheAll = result;
                // var interm = new Map<string, Node>();

                // for(var index in result){
                //     interm.set(result[index].public_key, result[index]);
                // }
                // nodeCache.clear();
                // nodeCache = interm;
                // resolve(nodeCacheAll);


            }
            release();
        });


    }
    app.get('/latest-version', (req, res) => {
        res.send(JSON.stringify(latestVersion));
    });
    app.get('/node/score-peers', (req, res) => {
        Logger.info("Received request for the security assessment score and peer connections of a node.");
    });

    // A function called when during a request the cache is expired
    function changeCache(res: any) {
        //THIS CODE HERE NEEDS TO BE EXAMINED
        // mutex.acquire().then(async (release)=>{
        //     if(cacheExpiry<new Date()){
        //         await updateCache();
        //     }

        //     if(res!=null) res.send(JSON.stringify(nodeCacheAll));
        //     release();
        // });
        if (res != null) res.send(JSON.stringify(nodeCacheAll));
    }

    app.get('/node/get-all-nodes', (req, res) => {
        Logger.info("Received request for all nodes' geographic coordinates and basic data.");
        if (cacheExpiry < new Date()) {
            changeCache(res);
        } else {
            res.send(JSON.stringify(nodeCacheAll));
        }

    });

    // app.get('/node/peers', (req, res) => {
    //     Logger.info('Received request for the peer connections of a node.');

    //     let public_key: string = String(req.query.public_key);

    //     if (is_key_present(public_key, res)) {
    //         getNodeOutgoingPeers(public_key).then((results) => {
    //             res.send(JSON.stringify(results));
    //         }).catch((err: Error) => {
    //             Logger.error(err.message);
    //             res.status(400).send(err.message);


    //     const public_key: String = String(req.query.public_key);
    //     if (is_key_present(public_key, res)) {
    //         const duration: number = req.query.duration ? Number(req.query.duration) : 30;

    //         getHistoricalData(public_key, duration).then((result) => {
    //             res.send(JSON.stringify(result));
    //         }).catch((err: Error) => {
    //             Logger.error(err.message);
    //             res.status(400).send(err.message);
    //         });
    //     }


    // // app.get('/last-modifications', (req, res) => {

    // //     Logger.info("Received request for checking the last modification timestamps.");
    // //     res.send(JSON.stringify({
    // //         LAST_CRAWL: LAST_CRAWL,
    // //         LAST_SEC_SCAN: LAST_SEC_SCAN,
    // //         LAST_TRUST_SCAN: LAST_TRUST_SCAN
    // //     }));

    // // });

    //     const public_key: string = String(req.query.public_key);
    //     if (is_key_present(public_key, res)) {
    //         const duration: number = req.query.duration ? Number(req.query.duration) : 30;

    //         getValidatorHistoricalData(public_key, duration).then((results) => {
    //             res.send(JSON.stringify(results));
    //         }).catch((err: Error) => {
    //             Logger.error(err.message);
    //             res.status(400).send(err.message);
    //         });


    // app.get('/node/score-peers', (req, res) => {
    //     Logger.info("Received request for the security assessment score and peer connections of a node.");
    // });

    // app.get('/node/score', (req, res) => {
    //     var pub_key = req.query;
    //     var public_key: String = String(req.query.public_key);
    //     getHistoricalData(function (result): void{
    //         res.send(calculateSMA(result) + " " +  calculateEMA(result));
    //     }, public_key, 30);
    //     Logger.info("Received request for the security assessment score of a node.");
    // });


    //TODO: SHOULD WE STORE THE JSON DIRECTLY OF THE PEER LIST?
    app.get('/node/peers', (req, res) => {
        Logger.info('Received request for the peer connections of a node.');

        let public_key: string = String(req.query.public_key);
        if (public_key === null) {
            Logger.error(ERROR_KEY_NOT_FOUND);
            res.status(404).send(ERROR_KEY_NOT_FOUND);
        } else {
            if (cacheExpiry < new Date()) {
                changeCache(null);
                peerCache.clear();

                getNodeOutgoingPeers(public_key).then((results) => {
                    peerCache.set(public_key, results);
                    res.send(JSON.stringify(results));
                });

            } else {
                if (peerCache.has(public_key)) {
                    res.send(JSON.stringify(peerCache.get(public_key)))
                } else {
                    getNodeOutgoingPeers(public_key).then((results) => {
                        peerCache.set(public_key, results);
                        res.send(JSON.stringify(results));
                    });
                }
            }

        }
    });

    // app.get('/node/history', (req, res) => {
    //     Logger.info('Received request for the history of security analysis of a node.');

    //     const public_key: String = String(req.query.public_key);
    //     if (public_key === null) {
    //         Logger.error(ERROR_KEY_NOT_FOUND);
    //         res.status(400).send(ERROR_KEY_NOT_FOUND);
    //     }
    //     else {
    //         const duration: number = req.query.duration ?  Number(req.query.duration) : 30;

    //         getHistoricalData(function (result): void{
    //             res.send(JSON.stringify(result));
    //         }, public_key, duration);
    //     }

    // });

    // app.get('/validator/history', (req, res) => {
    //     Logger.info('Received request for the history of trust analysis of a validator.');

    //     const public_key: string = String(req.query.public_key);
    //     if (public_key === null) {
    //         Logger.error(ERROR_KEY_NOT_FOUND);
    //         res.status(400).send(ERROR_KEY_NOT_FOUND);
    //     }
    //     else {
    //         const duration: number = req.query.duration ?  Number(req.query.duration) : 30;
    //         getValidatorHistoricalData(public_key, duration, (err, results) => {
    //             if (err) {
    //                 let error_string: string = `${ERROR_DATABASE_QUERY} : ${err.message}`;
    //                 Logger.error(error_string);
    //                 res.status(400).send(error_string);
    //             }
    //             else res.send(JSON.stringify(results));
    //         });
    //     }

    // });


    app.get('/node/info', (req, res) => {
        Logger.info('Received request for information of a node.');

        const public_key: string = String(req.query.public_key);
        if (is_key_present(public_key, res)) {
            getNode(public_key).then((results) => {
                if (results.length === 0) {
                    res.status(404).send();
                } else {
                    res.send(JSON.stringify(results));
                }
            }).catch((err: Error) => {
                Logger.error(err.message);
                res.status(400).send(err.message);
            });
        }
    });
}