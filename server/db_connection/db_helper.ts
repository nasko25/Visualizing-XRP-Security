import { Node } from './models/node'
import { Connection } from './models/connection'
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'db',
    port: '3306',
    user: 'root',
    password: 'pass',
    database: 'db'
})

export function insertNode(node: Node): void {
    var insert_query: string = 'INSERT INTO node (IP, rippled_version, public_key, uptime) VALUES (\'' +
        node.IP + '\', \'' +
        node.rippled_verison + '\', \'' +
        node.public_key + '\', \'' +
        node.uptime + '\');';
    
    connection.query(insert_query, function (err: Error, results: any, fields: JSON) {
        if (err) {
            console.log(err);
            throw err;
        }
    });
}

export function insertConnection(start_node: Node, end_node: Node): void {
    var insert_query: string = 'INSERT INTO connection (start_node, end_node) VALUES (\'' + start_node.node_id + '\', \'' + end_node.node_id + '\');';
    console.log(insert_query);
    connection.query(insert_query, function (err: Error, results: any, fields: JSON) {
        if (err) {
            console.log(err);
            throw err;
        }
    });
}

export function getAllNodes(callback: (res: Node[]) => void): void {
    var get_all_nodes_query = 'SELECT * FROM node;';
    connection.query(get_all_nodes_query, function (err: Error, results: JSON[], fields: JSON) {
        if (err) {
            console.log(err);
            throw err;
        }
        var res = JSON.parse(JSON.stringify(results));
        return callback(res);
    });
}

export function getAllConnections(callback: (res: Connection[]) => void): void {
    var get_all_nodes_query = 'SELECT * FROM connection;';
    connection.query(get_all_nodes_query, function (err: Error, results: JSON[], fields: JSON) {
        if (err) {
            console.log(err);
            throw err;
        }
        var res = JSON.parse(JSON.stringify(results));
        return callback(res);
    });
}