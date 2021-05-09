import express from 'express';
import { Node } from './db_connection/models/node'
import { Connection } from './db_connection/models/connection'
import { SecurityAssessment } from './db_connection/models/security_assessment'
import { insertNode, getAllNodes, insertConnection, getAllConnections, getAllSecurityAssessments, insertSecurityAssessment } from "./db_connection/db_helper";
var mysql = require('mysql');

const app = express();

const PORT = 8080;

app.get('/', (req, res) => {
    res.send('Well done!');
})

app.get('/insert-node', (req, res) => {
    var n: Node = {IP: '127.0.0.1', rippled_version: '1.7.0', public_key: 'pk', uptime: 10};
    insertNode(n);
    res.send("node inserted");
})

app.get('/insert-sas', (req, res) => {
    var sa : SecurityAssessment = {public_key: 'pub_key_1', metric_version: 0.1, score: 1};
    insertSecurityAssessment(sa);
    res.send('Security assessment inserted.');
})

app.get('/insert-connection', (req, res) => {
    var start_node: Node = {node_id: 1, IP: '127.0.0.1', rippled_version: '1.7.0', public_key: 'pk', uptime: 10};
    var end_node: Node = {node_id: 2, IP: '127.0.0.1', rippled_version: '1.7.0', public_key: 'pk', uptime: 10};
    insertConnection(start_node, end_node);
    res.send("connection inserted");
})

app.get('/get-all-nodes', (req, res) => {
    var nodes = getAllNodes(function (result): void {
        res.send(JSON.stringify(result));
    });
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

app.listen(PORT, () => {
    console.log(`The application is listening on port ${PORT}!`);
})
