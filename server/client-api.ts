
import { Express, Response } from 'express'
import { calculateEMA, calculateSMA } from './calculate_metrics';
import { ERROR_DATABASE_QUERY, ERROR_KEY_NOT_FOUND } from './config/messages';
import { getAllNodes, getHistoricalData, getNode, getNodeOutgoingPeers, getValidatorHistoricalData } from './db_connection/db_helper';
import Logger from './logger';
import {Node} from "./db_connection/models/node";
import { Connection } from './db_connection/models/connection';
import {Mutex} from 'async-mutex';
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
interface PeerList{
    peers: Connection[];
    timestamp: Date;
}

function is_key_present(key: String, res: Response): boolean {
    if(key === null){
        Logger.error(ERROR_KEY_NOT_FOUND);
        res.status(400).send(ERROR_KEY_NOT_FOUND);
        return true;
    }
    return false;
}

function is_error_present(err: Error, res: Response): boolean {
    if (err) {
        let error_string: string = `${ERROR_DATABASE_QUERY} : ${err.message}`;
        Logger.error(error_string);
        res.status(400).send(error_string);
        return true;
    }
    return false;
}

export default function setupClientAPIEndpoints(app: Express) {
    const mutex = new Mutex();
    var cacheExpiry: Date = new Date();
    var nodeCacheAll: Node[] = [{IP: "4242", rippled_version: "22", public_key: "242", uptime: 42}];
    var peerCache: Map<string, Connection[]> = new Map();
    var nodeCache: Map<string, Node> = new Map();

    async function cacheUpdater(){
        updateCache().then();
    }
    cacheUpdater();
    setInterval(cacheUpdater, MINUTES_BEFORE_CACHE_EXPIRES*60*1000);

    // A function called to update the function periodically
    async function updateCache(){
        return new Promise(resolve =>{
            Logger.info("Cache expired, updating");
            cacheExpiry.setMinutes(cacheExpiry.getMinutes() + 2*MINUTES_BEFORE_CACHE_EXPIRES);
            
            getAllNodes(function (err, result): void {
                nodeCacheAll = result;
                var interm = new Map<string, Node>();
                
                for(var index in result){
                    interm.set(result[index].public_key, result[index]);
                }
                nodeCache.clear();
                nodeCache = interm;
                resolve(nodeCacheAll);
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
        });
        
    }

    function changeCache(res: any){
        //THIS CODE HERE NEEDS TO BE EXAMINED
        // mutex.acquire().then(async (release)=>{
        //     if(cacheExpiry<new Date()){
        //         await updateCache();
        //     }
            
        //     if(res!=null) res.send(JSON.stringify(nodeCacheAll));
        //     release();
        // });
        if(res!=null) res.send(JSON.stringify(nodeCacheAll));
    }

    // app.get('/last-modifications', (req, res) => {

    //     Logger.info("Received request for checking the last modification timestamps.");
    //     res.send(JSON.stringify({
    //         LAST_CRAWL: LAST_CRAWL,
    //         LAST_SEC_SCAN: LAST_SEC_SCAN,
    //         LAST_TRUST_SCAN: LAST_TRUST_SCAN
    //     }));

    // });

    app.get('/node/get-all-nodes', (req, res) => {
        Logger.info("Received request for all nodes' geographic coordinates and basic data.");
        if(cacheExpiry<new Date()){
            changeCache(res);
        }else{
            res.send(JSON.stringify(nodeCacheAll));
        }
      
    });
    
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
            if(cacheExpiry<new Date()){
                changeCache(null);
                peerCache.clear();
                getNodeOutgoingPeers(public_key, (err, results) => {
                    if (err) {
                        let error_string: string = `${ERROR_DATABASE_QUERY} : ${err.message}`;
                        Logger.error(error_string);
                        res.status(404).send(error_string);
                    }
                    else{
                        peerCache.set(public_key, results);
                        res.send(JSON.stringify(results));
                    }
                });
            }else{
                if(peerCache.has(public_key)){
                    res.send(JSON.stringify(peerCache.get(public_key)))
                }else{
                    getNodeOutgoingPeers(public_key, (err, results) => {
                        if (err) {
                            let error_string: string = `${ERROR_DATABASE_QUERY} : ${err.message}`;
                            Logger.error(error_string);
                            res.status(404).send(error_string);
                        }
                        else{
                            peerCache.set(public_key, results);
                            res.send(JSON.stringify(results));
                        }
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
        if (!is_key_present(public_key, res)) {
            getNode(public_key, (err, results) => {
                if(!is_error_present(err, res)) {
                    res.send(JSON.stringify(results));
                }
            });
        }
    });
}