import { Node, NodePorts } from './models/node'
import { Connection } from './models/connection'
import { SecurityAssessment } from './models/security_assessment'

var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'db',
    port: '3306',
    user: 'root',
    password: 'pass',
    database: 'db'
})

function voidCallback(err: Error, results:any, fields: JSON) {
    if (err) {
        console.log(err);
        throw err;
    }
}

function selectCallback(callback : (res: NodePorts[]) => void ):any  {
    
    return function(err: Error, results: any, fields: JSON) {
        if (err) { 
            console.log(err);
            throw err;
        }
        var res = JSON.parse(JSON.stringify(results));
        return callback(res);
    };
}

export function insertNode(node: Node): void {
    var insert_query: string = 'INSERT INTO node (IP, rippled_version, public_key, uptime) VALUES (\'' +
        node.IP + '\', \'' +
        node.rippled_version + '\', \'' +
        node.public_key + '\', \'' +
        node.uptime + '\');';

    connection.query(insert_query, voidCallback);
}

export function insertConnection(start_node: Node, end_node: Node): void {
    var insert_query: string = 'INSERT INTO connection (start_node, end_node) VALUES (\'' +
        start_node.node_id + '\', \'' +
        end_node.node_id + '\');';
    
    connection.query(insert_query, voidCallback);
}

export function insertSecurityAssessment(security_assessment: SecurityAssessment): void {
    var insert_query: string = 'INSERT INTO security_assessment (public_key, metric_version, score) VALUES (\'' +
        security_assessment.public_key + '\', \'' +
        security_assessment.metric_version + '\', \'' +
        security_assessment.score + '\');';

    connection.query(insert_query, voidCallback);
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

export function getAllSecurityAssessments(callback: (res: Node[]) => void): void {
    var get_all_nodes_query = 'SELECT * FROM security_assessment;';
    connection.query(get_all_nodes_query, function (err: Error, results: JSON[], fields: JSON) {
        if (err) {
            console.log(err);
            throw err;
        }
        var res = JSON.parse(JSON.stringify(results));
        return callback(res);
    });
}

 
// [ "port:protocol", "port:protocol" ] 
export function getNodesNonNullPort(callback: (res: NodePorts[]) => void):void  {
    var get_nodes_non_null = 'SELECT ip, ports FROM node WHERE ports IS NOT NULL;';
    connection.query(get_nodes_non_null, function(err: Error, results: JSON[], fields: JSON) {

        if (err) {
            console.log(err.message);
            throw err;
        }
        var res: NodePorts[] = JSON.parse(JSON.stringify(results));
        return callback(res);

    });

}