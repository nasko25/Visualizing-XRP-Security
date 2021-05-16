import express from 'express';
import Crawler from './crawl'
import PortScanner from './portScan'
import { promises as fs } from 'fs';
import { Node as CrawlerNode } from './crawl';
import { SecurityAssessment } from './db_connection/models/security_assessment'
import { insertNode, getAllNodes, insertConnection, getAllConnections, getAllSecurityAssessments, insertSecurityAssessment, getHistoricalData, getNodeOutgoingPeers } from "./db_connection/db_helper";

// Logger
import Logger from './logger'
import setupClientAPIEndpoints from './client-api';

var mysql = require('mysql');

const app = express();

const PORT = 8080;

app.get('/', (req, res) => {
    res.send('Well done!');
});

async function startCrawler() {
    // read a list of ripple server urls from the config file, and split them by one or more spaces or new lines
    let rippleServersArr = (await fs.readFile('config/ripple_servers.list','utf8')).split(/[\s|\n]+/);

    // remove the empty last line
    rippleServersArr.splice(-1, 1);
    console.log(rippleServersArr);
    let crawler = new Crawler(rippleServersArr);
    crawler.crawl()
    // for the moment simply display what has been collected in console
}

async function startPortScanner() {

    
    let portScanner = new PortScanner();
    portScanner.start()
}
startCrawler().catch((e) => {
    console.log(`Crawler exited with the exception: ${e}.`);
});
startPortScanner().catch((e) => {
    console.log(`Crawler exited with the exception: ${e}.`);
});
app.get('/insert-node', (req, res) => {
    var n: CrawlerNode = {ip: '127.0.0.1', port: 51235, version: '1.7.0', pubkey: 'pk', uptime: 10};
    insertNode(n);
    res.send("node inserted");
})

app.get('/insert-sas', (req, res) => {
    var sa : SecurityAssessment = {public_key: 'pub_key_1', metric_version: 0.1, score: 1};
    insertSecurityAssessment(sa);
    res.send('Security assessment inserted.');
})

app.get('/insert-connection', (req, res) => {
    var start_node: CrawlerNode = {ip: '127.0.0.1', port: 51235, version: '1.7.0', pubkey: 'pk', uptime: 10};
    var end_node: CrawlerNode = {ip: '127.0.0.1', port: 51235, version: '1.7.0', pubkey: 'pk', uptime: 10};
    insertConnection(start_node, end_node);
    res.send("connection inserted");
})

app.get('/get-all-connections', (req, res) => {
    var nodes = getAllConnections(function (result): void {
        res.send(JSON.stringify(result));
    });
})

app.get('/get-all-sas', (req, res) => {
    var nodes = getAllSecurityAssessments(function (result): void {
        res.send(JSON.stringify(result));
    });
})

// Add the Client API Endpoints to the server
setupClientAPIEndpoints(app);

app.listen(PORT, () => {
    console.log(`The application is listening on port ${PORT}!`);
});
