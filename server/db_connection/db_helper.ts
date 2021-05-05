import {Node} from './models/node'
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'db',
    port: '3306',
    user: 'root',
    password: 'pass',
    database: 'db'
})

export function insertNode(node: Node): void{
    var insert_query: string = 'INSERT INTO node (IP, rippled_version) VALUES (\'' + node.IP + '\', \'' + node.rippled_verison +'\');';
    console.log(insert_query);
    connection.query(insert_query, function(err: Error, results: any, fields: JSON){
        if (err) {
            console.log(err);
            return [];
        }
        console.log(err, results, fields);
    });
}

export function getAllNodes(): Node[]{
    var get_all_nodes_query = 'SELECT * FROM node;';
    connection.query(get_all_nodes_query, function(err: Error, results: any, fields: JSON){
        if (err) {
            console.log(err);
            return [];
        }
        console.log(err, results, fields);
    })
    return [];
}