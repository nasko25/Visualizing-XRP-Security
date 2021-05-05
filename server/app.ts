import express from 'express';
import {Node} from './db_connection/models/node'
import { insertNode, getAllNodes } from "./db_connection/db_helper";
var mysql = require('mysql');

const app = express();

const PORT = 8080;

app.get('/', (req, res) => {
    res.send('Well done!');
})

app.get('/insert-node', (req, res) => {
    var n: Node = {IP: '127.0.0.1', rippled_verison: '1.7.0'};
    insertNode(n);
    res.send("node inserted");
})

app.get('/get-all-nodes', (req, res) => {
    getAllNodes();
    res.send("nodes retrieved");
})

app.listen(PORT, () => {
    console.log(`The application is listening on port ${PORT}!`);
})
