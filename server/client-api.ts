
import { Express, Response } from 'express'
import { ERROR_KEY_NOT_FOUND } from './config/messages';
import { getLastSecurityAssessmentsForNode, getAllNodes, getHistoricalData, getNode, getPeersWithScores, getAllValidatorAssessments, getValidatorHistoricalData, getAllNodesSecurity, getValidatorHistoricalAvgScore } from './db_connection/db_helper';
import Logger from './logger';
import { Node } from "./db_connection/models/node";
import { Mutex } from 'async-mutex';
import { SecurityAssessment } from './db_connection/models/security_assessment';
export var LAST_CRAWL: number = Date.now();
export var LAST_SEC_SCAN: number = Date.now();
export var LAST_TRUST_SCAN: number = Date.now();

//Controls when does the cache expire:
const MINUTES_BEFORE_CACHE_EXPIRES: number = 1;

/** 
 * This file exports a function which takes an Express object
 * and adds a couple of endpoints to it. These are the endpoints
 * meant for use by the Web Client of the application. You can find
 * the API specification in server/docs/client_api.md
 */

export type PeerToSend = {
    public_key: string,
    score: number,
    timestamp: Date,
    metric_version: string
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

export default function setupClientAPIEndpoints(app: Express, verbosity: number) {

    // A mutex used when the cache is being updated
    const mutex = new Mutex();
    const VERBOSE_LEVEL = verbosity;
    // A timestamp to track when the cache has to be updated if its information is requested
    var cacheExpiry: Date = new Date();
    var latestVersion: string = "rippled-1.7.0"
    // The cache objects: For requests for all nodes | peers of a node | information about a node
    var peerCache: Map<string, PeerToSend[]> = new Map();
    var nodeCache: Map<string, Node> = new Map();
    var historyCache: Map<string, SecurityAssessment[]> = new Map();

    // A function that independently updates the cache periodically once per a longer period
    // async function cacheUpdater() {
    //     updateCache().then(() => setTimeout(cacheUpdater, MINUTES_BEFORE_CACHE_EXPIRES * 60 * 1000));
    // }

    updateCache();
    process.on('message', (data) => {
        if (data && data.toString().includes('rippled-')) {
            latestVersion = data.toString();
            updateCache();
        }
    })

    async function updateCache() {
        if (mutex.isLocked()) return;
        mutex.acquire().then(async (release) => {
            if (true) {

                peerCache.clear();
                if(VERBOSE_LEVEL>2) Logger.info("Cache expired, updating");
                // update the expiration timestamp
                cacheExpiry.setMinutes(cacheExpiry.getMinutes() + 2 * MINUTES_BEFORE_CACHE_EXPIRES);

                getAllNodes().then((result) => {
                    var interm = new Map<string, Node>();

                    for (var index in result) {
                        interm.set(result[index].public_key, result[index]);
                    }
                    nodeCache.clear();
                    nodeCache = interm;
                }).catch((err: Error) => {
                    Logger.error(err.message);
                });
            }
            release();
        });
    }

    app.get('/node/get-all-nodes', (req, res) => {
        if(VERBOSE_LEVEL>1) Logger.info("Received request for all nodes' geographic coordinates and basic data.");

        getAllNodes().then((results) => {
            res.send(JSON.stringify(results));
        }).catch((err) => {
            res.status(400).send(err.message);
        });

    });

    app.get('/node/get-all-nodes-and-score', (req, res) => {
        getAllNodesSecurity().then((result) => {
            let latestScores = result.map((node, idx) => {
                let timestamps = node.timestamps.split(',');
                let scores = node.scores.split(',');

                let ts_scores = timestamps.map((ts, i) => {
                    return {
                        timestamp: new Date(ts),
                        score: scores[i]
                    }
                });

                let latest = ts_scores.sort((t1, t2) => {
                    if (t1.timestamp > t2.timestamp) {
                        return -1;
                    }
                    return 1;
                })[0];

                return {
                    public_key: node.public_key,
                    rippled_version: node.rippled_version,
                    uptime: node.uptime,
                    longtitude: node.longtitude,
                    latitude: node.latitude,
                    score: latest.score,
                    timestamp: latest.timestamp,
                    // history: ts_scores
                };
            });
            res.send(JSON.stringify(latestScores));
        }).catch((err) => {
            let error_string: string = `Error in getting all nodes and their security score: ${err.message}`;
            Logger.error(error_string);
            res.status(400).send(error_string);
        });
    });

    app.get('/node/peers', (req, res) => {
        if(VERBOSE_LEVEL>1) Logger.info('Received request for the peer connections of a node.');

        let public_key: string = String(req.query.public_key);
        if (is_key_present(public_key, res)) {
            if (cacheExpiry < new Date()) {
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
        if(VERBOSE_LEVEL>1) Logger.info('Received request for information of a node.');

        const public_key: string = String(req.query.public_key);
        if (is_key_present(public_key, res)) {
            getNode(public_key).then((results) => {
                if (results.length === 0) {
                    res.status(404).send("Node not found.");
                } else {
                    getHistoricalData(public_key, 30)
                        .then((history) => {
                            historyCache.set(public_key, history);
                            getLastSecurityAssessmentsForNode(public_key).then(([assessment]) => {
                                res.send(JSON.stringify([
                                    {
                                        IP: results[0].IP,
                                        latitude: results[0].latitude,
                                        longtitude: results[0].longtitude,
                                        ports: results[0].ports,
                                        public_key: results[0].public_key,
                                        publishers: results[0].publishers,
                                        rippled_version: results[0].rippled_version,
                                        uptime: results[0].uptime,
                                        history: history,
                                        score: assessment.score,
                                        timestamp: assessment.timestamp
                                    }
                                ]));
                            }).catch((err) => {
                                Logger.error(`Error in most recent security score + ${err.message}`);
                            res.status(400).send(err.message);
                            })
                        }).catch((err) => {
                            Logger.error(`Error in getting historical data + ${err.message}`);
                            res.status(400).send(err.message);
                        });
                }
            }).catch((err) => {
                Logger.error(`Error in getting node info + ${err.message}`);
                res.status(400).send(err.message);
            });
        }
    });

    app.get('/node/history', (req, res) => {
        if(VERBOSE_LEVEL>1) Logger.info('Received request for the history of security analysis of a node.');

        let public_key: string = String(req.query.public_key);

        if (is_key_present(public_key, res)) {
            const duration: number = req.query.duration ? Number(req.query.duration) : 30;
            if (cacheExpiry < new Date()) {
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
        if(VERBOSE_LEVEL>1) Logger.info('Received request for all validators\' basic information and trust score.');

        const duration: number = req.query.duration ? Number(req.query.duration) : 30;
        getAllValidatorAssessments().then((results) => {
            let latestScores = results.map((validator, idx) => {
                let timestamps = validator.timestamps.split(',');
                let scores = validator.scores.split(',');

                let ts_scores = timestamps.map((ts, i) => {
                    return {
                        timestamp: new Date(ts),
                        score: parseFloat(scores[i])
                    }
                });

                let latest = ts_scores.sort((t1, t2) => {
                    if (t1.timestamp > t2.timestamp) {
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
    });

    app.get('/validator/history', (req, res) => {
        if(VERBOSE_LEVEL>1) Logger.info('Received request for a validator\'s score history.');

        let public_key: string = String(req.query.public_key);
        let duration: number = Number(req.query.duration);
        if (!(duration && duration !== undefined)) {
            duration = 30;
        }
        if(VERBOSE_LEVEL>2) console.log(public_key);
        if(VERBOSE_LEVEL>2) console.log(duration);
        if (is_key_present(public_key, res)) {
            getValidatorHistoricalData(public_key, duration)
                .then((results) => {
                    if(VERBOSE_LEVEL>2) console.log(results);
                    res.send(JSON.stringify(results));
                })
                .catch((err) => {
                    res.status(400).send(err.message);
                })
        }
    })

    app.get('/validator/history-score', (req, res) => {
        if(VERBOSE_LEVEL>1) Logger.info('Received request for a validator\'s score history.');

        let public_key: string = String(req.query.public_key);
        let duration: number = Number(req.query.duration);
        if (!(duration && duration !== undefined)) {
            duration = 30;
        }
        if(VERBOSE_LEVEL>2) console.log(public_key);
        if(VERBOSE_LEVEL>2) console.log(duration);
        if (is_key_present(public_key, res)) {
            getValidatorHistoricalAvgScore(public_key, duration)
                .then((results) => {
                    if(VERBOSE_LEVEL>2) console.log(results);
                    res.send(JSON.stringify(results));
                })
                .catch((err) => {
                    res.status(400).send(err.message);
                })
        }
    });

}