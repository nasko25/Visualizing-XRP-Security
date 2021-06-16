
import { Express, Response } from 'express'
import { ERROR_DATABASE_QUERY, ERROR_KEY_NOT_FOUND } from './config/messages';
import { getAllNodes, getHistoricalData, getNode, getPeersWithScores, getAllValidatorAssessments, getValidatorHistoricalData } from './db_connection/db_helper';
import Logger from './logger';
import { Node } from "./db_connection/models/node";
import { Connection } from './db_connection/models/connection';
import { Mutex } from 'async-mutex';
import { SecurityAssessment } from './db_connection/models/security_assessment';
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

export type PeerToSend = {
    public_key: string,
    score: number,
    timestamp: Date,
    metric_version: string
}

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
    if (key && key !== 'undefined') {
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
    var peerCache: Map<string, PeerToSend[]> = new Map();
    var nodeCache: Map<string, Node> = new Map();
    var historyCache: Map<string, SecurityAssessment[]> = new Map();

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
        if (mutex.isLocked()) return;
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

    app.get('/node/peers', (req, res) => {
        Logger.info('Received request for the peer connections of a node.');

        let public_key: string = String(req.query.public_key);
        if (is_key_present(public_key, res)) {
            if (cacheExpiry < new Date()) {
                changeCache(null);
                peerCache.clear();

                getPeersWithScores(public_key).then((results) => {
                    let to_send = new Map<string, PeerToSend>();
                    results.forEach((peer) => {
                        let dict_peer = to_send.get(peer.public_key);
                        if (dict_peer && dict_peer !== undefined) {
                            if (dict_peer.timestamp > peer.timestamp) {
                                to_send.set(peer.public_key, peer);
                            }
                        } else {
                            to_send.set(peer.public_key, peer);
                        }
                    });
                    peerCache.set(public_key, Array.from(to_send.values()));
                    res.send(JSON.stringify(Array.from(to_send.values())));
                }).catch((err) => {
                    Logger.error(err);
                });

            } else {
                if (peerCache.has(public_key)) {
                    res.send(JSON.stringify(peerCache.get(public_key)));
                } else {
                    getPeersWithScores(public_key).then((results) => {
                        peerCache.set(public_key, results);
                        res.send(JSON.stringify(results));
                    }).catch((err) => {
                        Logger.error(err);
                    });
                }
            }
        }
    });

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

    app.get('/node/history', (req, res) => {
        Logger.info('Received request for the history of security analysis of a node.');

        let public_key: string = String(req.query.public_key);

        if (is_key_present(public_key, res)) {
            const duration: number = req.query.duration ? Number(req.query.duration) : 30;
            if (cacheExpiry < new Date()) {
                changeCache(null);
                historyCache.clear();
                getHistoricalData(public_key, duration)
                    .then((results) => {
                        res.send(JSON.stringify(results));
                        historyCache.set(public_key, results);
                    }).catch((err) => {
                        Logger.error(`Error in getting historical data + ${err.message}`);
                    });
            } else {
                if (historyCache.has(public_key)) {
                    res.send(JSON.stringify(historyCache.get(public_key)));
                } else {
                    getHistoricalData(public_key, duration)
                        .then((results) => {
                            res.send(JSON.stringify(results));
                            historyCache.set(public_key, results);
                        }).catch((err) => {
                            Logger.error(`Error in getting historical data + ${err.message}`);
                            res.status(400).send(err.message);
                        });
                }
            }
        }
    });

    app.get('/validator/get-all-validators', (req, res) => {
        Logger.info('Received request for all validators\' basic information and trust score.');

        const public_key: string = String(req.query.public_key);
        if (public_key === null) {
            Logger.error(ERROR_KEY_NOT_FOUND);
            res.status(400).send(ERROR_KEY_NOT_FOUND);
        }
        else {
            const duration: number = req.query.duration ? Number(req.query.duration) : 30;
            getAllValidatorAssessments().then((results) => {
                let latestScores = results.map((validator, idx) => {
                    let timestamps = validator.timestamps.split(',');
                    let scores = validator.scores.split(',');

                    let ts_scores = timestamps.map((ts, i) => {
                        return {
                            timestamp: new Date(ts),
                            score: scores[i]
                        }
                    });

                    let latest = ts_scores.sort((t1, t2) => {
                        if (t1.timestamp > t2.timestamp){
                            return -1;
                        }
                        return 1;
                    })[0];

                    return {
                        public_key: validator.public_key,
                        score: latest.score,
                        timestamp: latest.timestamp,
                        history: ts_scores
                    };
                });
                res.send(JSON.stringify(latestScores));
            }).catch((err) => {
                let error_string: string = `Error in getting all validators: ${err.message}`;
                Logger.error(error_string);
                res.status(400).send(error_string);
            });
        }
    });

    app.get('/validator/history', (req, res) => {
        Logger.info('Received request for a validator\'s score history.');

        let public_key: string = String(req.query.public_key);
        let duration: number = Number(req.query.duration);
        if(!(duration && duration !== undefined)){
            duration = 30;
        }
        console.log(public_key);
        console.log(duration);
        if (is_key_present(public_key, res)) {
            getValidatorHistoricalData(public_key, duration)
            .then((results) => {
                console.log(results);
                res.send(JSON.stringify(results));
            })
            .catch((err) => {
                res.status(400).send(err.message);
            })
        }
    })

}