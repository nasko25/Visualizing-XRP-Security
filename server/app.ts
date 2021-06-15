import express from 'express';
var cors = require('cors');
import Crawler from './crawl'
import PortScanner from './portScan'
import { promises as fs } from 'fs';
import { Node as CrawlerNode } from './crawl';
import GeoLocate from './geoLocate';
import { insertNode, getAllNodes, insertConnection, getAllConnections, getAllSecurityAssessments, insertSecurityAssessment, getHistoricalData, getNodeOutgoingPeers } from "./db_connection/db_helper";
import * as exec from "child_process";
import config from './config/config.json';
import Logger from "./logger";
import setupClientAPIEndpoints from "./client-api";
import ValidatorIdentifier from './validators';
import ValidatorTrustAssessor from './validator_trust_assessor';
import { ValidatorMonitor } from './validator_monitor';
import NmapInterface from './nmapInterface';
import Security_Scanner from './security_scanner';
import { EventEmitter } from 'events';


if (process.argv[2] == "crawler") {
    Logger.info("CRAWLER STARTED")
    repeated_crawl();
} else if (process.argv[2] == "portScanner") {
    var ranBefore = false;
    process.on('message', (data) => {
        if(data && data=='start' && !ranBefore){
            ranBefore=false;
            Logger.info("PORT SCANNER STARTED 21")
            startPortScanner().catch((e) => {
                console.log(`PortScanner exited with the exception: ${e}.`);
            })
        }
    });
} else if (process.argv[2] == "validator") {
    var ble = new Security_Scanner(2);

    process.on('message', (data)=>{
        if(data && data=='start'){
            // Logger.info("VALIDATOR STARTED 29")
            start_validator_identification();
            Logger.info("STARTING SECURITY ANALYSIS AND VALIDATOR TRUST ASSESSMENT");
            ble.start();

            // the validator monitor will emit an event when it is done;
            // the trust assessor listens for that event and starts only when it is received
            const eventEmitter = new EventEmitter();
            new ValidatorTrustAssessor(eventEmitter);
            new ValidatorMonitor(eventEmitter);
        }
    });


} else if (process.argv[2] == "api") {
    const app = express();
    app.use(cors());

    const PORT = 8080;

    app.get("/", (req, res) => {
        res.send("Well done!");
    });

    // Add the Client API Endpoints to the server
    setupClientAPIEndpoints(app);

    app.listen(PORT, () => {
        console.log(`The application is listening on port ${PORT}!`);
    });
} else {
    var firstTimeCrawl: boolean = true;


    //Preparations for a for bomb:
    var crawlerup = true;
    var portUp = true;
    var valdiatorUp = true;
    var apiUp = true;
    
    //Starts the crawler service
    var crawler = exec.fork(__dirname + "/app.js", ["crawler"]);
    crawler.on('close', (code) => {
        console.log(`crawler process exited with code ${code}`);
    });

    //Starts the api service
    var api = exec.fork(__dirname + "/app.js", ["api"]);
    api.on('close', (code) => {
        console.log(`API process exited with code ${code}`);
    });



    //Starts the validator service
    var validator = exec.fork(__dirname + "/app.js", ["validator"]);
    validator.on('close', (code) => {
        console.log(`validator process exited with code ${code}`);
    });

    validator.on('message',(data)=>{
        Logger.info(data);
        if(data && data == 'finished'){
            Logger.info("val proc finish")
            api.send('upd');
        }
    })

    //Starts the portscanner service
    var portScanner = exec.fork(__dirname + "/app.js", ["portScanner"]);
    portScanner.on('close', (code) => {
        console.log(`portscanner process exited with code ${code}`);
    });

    crawler.on('message',(data)=>{
        console.log(data)
        if(data && data == 'crwrldn'){
            if(firstTimeCrawl){
                firstTimeCrawl=false;
                portScanner.send('start');
            }

            validator.send('start');
        }
    });

}


async function startCrawler() {
    // read a list of ripple server urls from the config file, and split them by one or more spaces or new lines
    let rippleServersArr = (
        await fs.readFile("config/ripple_servers.list", "utf8")
    ).split(/[\s|\n]+/);

    // remove the empty last line
    rippleServersArr.splice(-1, 1);
    console.log(rippleServersArr);
    let crawler = new Crawler(rippleServersArr);
    crawler.crawl();
    // for the moment simply display what has been collected in console
}


// Function for the crawling process
// Runs the crawler repeatedly by setting a timeout and after a specified period of time calls the function
// Currently the crawler is ran every 5 minutes
function repeated_crawl() {
    console.log("\n");
    console.log("Crawler ran...");
    startCrawler().catch((e) => {
        console.log(`Crawler exited with the exception: ${e}.`);
        return;
    });

    // start the geoip lookup 30 seconds after the crawler to give time to the crawler to add some IPs to the database
    setTimeout(() =>{
        (<any> process).send('crwrldn')
         new GeoLocate().locate()
        }, 30 * 1000);
    setTimeout(repeated_crawl, config.crawler_interva * 60000);
}

function start_validator_identification() {
    Logger.info("Starting validator identification")

    let valIden: ValidatorIdentifier = new ValidatorIdentifier(50);
    valIden.run();
}

// start_validator_identification();



// startPortScanner().catch((e) => {
//     console.log(`Crawler exited with the exception: ${e}.`);
// });

async function startPortScanner() {

    let portScanner = new PortScanner(new NmapInterface());
    portScanner.setDoLongScans(config.DO_LONG_SCAN).setTimeoutLS(config.TIMEOUT_LONG_SCAN)
        .setTimeoutSS(config.TIMEOUT_SHORT_SCAN).setTopPorts(config.TOP_PORTS).setTLevelShort(config.T_LEVEL_SHORT)
        .setTLevelLong(config.T_LEVEL_LONG).setMaxShortScans(config.MAX_SHORT_SCANS).setMaxLongScans(config.MAX_LONG_SCANS)
        .setMinutesBetweenLS(config.MINUTES_BETWEEN_LONG_SCANS).setDaysBetweenSS(config.DAYS_BETWEEN_SHORT_SCANS).setVerboseLevel(config.VERBOSE_LEVEL);
    portScanner.start()
}



