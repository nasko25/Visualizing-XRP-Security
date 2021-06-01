import express from 'express';
var cors = require('cors');
import Crawler from './crawl'
import PortScanner from './portScan'
import { promises as fs } from 'fs';
import { Node as CrawlerNode } from './crawl';
import GeoLocate from './geoLocate';

// Logger
import Logger from "./logger";
import setupClientAPIEndpoints from "./client-api";
import ValidatorIdentifier from './validators';

//Given in minutes:
const CRAWLER_INVERVAL: number = 5;

const app = express();
app.use(cors());

const PORT = 8080;

app.get("/", (req, res) => {
    res.send("Well done!");
});

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

async function startPortScanner() {
    let portScanner = new PortScanner();
    portScanner.start()
}

// Function for the crawling process
// Runs the crawler repeatedly by setting a timeout and after a specified period of time calls the function
// Currently the crawler is ran every 5 minutes
function repeated_crawl() {
    console.log("\n");
    console.log("Crawler ran...");
    startCrawler().catch((e) => {
        console.log(`Crawler exited with the exception: ${e}.`);
    });

    // start the geoip lookup 30 seconds after the crawler to give time to the crawler to add some IPs to the database
    setTimeout(() => new GeoLocate().locate(), 30 * 1000);
    setTimeout(repeated_crawl, CRAWLER_INVERVAL*60000);
}

repeated_crawl();


function start_validator_identification() {
    Logger.info("Starting validator identification")
    let valIden: ValidatorIdentifier = new ValidatorIdentifier(50);
    valIden.run();
}

start_validator_identification();

// startPortScanner().catch((e) => {
//     console.log(`Crawler exited with the exception: ${e}.`);
// });

// Add the Client API Endpoints to the server
setupClientAPIEndpoints(app);

app.listen(PORT, () => {
    console.log(`The application is listening on port ${PORT}!`);
});
