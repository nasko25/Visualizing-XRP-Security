"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertPorts = exports.getNodesNonNullPort = exports.getAllSecurityAssessments = exports.getAllConnections = exports.getAllNodes = exports.insertSecurityAssessment = exports.insertConnection = exports.insertNode = void 0;
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'db',
    port: '3306',
    user: 'root',
    password: 'pass',
    database: 'db'
});
function voidCallback(err, results, fields) {
    if (err) {
        console.log(err);
        throw err;
    }
}
function selectCallback(callback) {
    return function (err, results, fields) {
        if (err) {
            console.log(err);
            throw err;
        }
        var res = JSON.parse(JSON.stringify(results));
        return callback(res);
    };
}
function insertNode(node) {
    var insert_query = 'INSERT INTO node (IP, rippled_version, public_key, uptime) VALUES (\'' +
        node.IP + '\', \'' +
        node.rippled_version + '\', \'' +
        node.public_key + '\', \'' +
        node.uptime + '\');';
    connection.query(insert_query, voidCallback);
}
exports.insertNode = insertNode;
function insertConnection(start_node, end_node) {
    var insert_query = 'INSERT INTO connection (start_node, end_node) VALUES (\'' +
        start_node.node_id + '\', \'' +
        end_node.node_id + '\');';
    connection.query(insert_query, voidCallback);
}
exports.insertConnection = insertConnection;
function insertSecurityAssessment(security_assessment) {
    var insert_query = 'INSERT INTO security_assessment (public_key, metric_version, score) VALUES (\'' +
        security_assessment.public_key + '\', \'' +
        security_assessment.metric_version + '\', \'' +
        security_assessment.score + '\');';
    connection.query(insert_query, voidCallback);
}
exports.insertSecurityAssessment = insertSecurityAssessment;
function getAllNodes(callback) {
    var get_all_nodes_query = 'SELECT * FROM node;';
    connection.query(get_all_nodes_query, function (err, results, fields) {
        if (err) {
            console.log(err);
            throw err;
        }
        var res = JSON.parse(JSON.stringify(results));
        return callback(res);
    });
}
exports.getAllNodes = getAllNodes;
function getAllConnections(callback) {
    var get_all_nodes_query = 'SELECT * FROM connection;';
    connection.query(get_all_nodes_query, function (err, results, fields) {
        if (err) {
            console.log(err);
            throw err;
        }
        var res = JSON.parse(JSON.stringify(results));
        return callback(res);
    });
}
exports.getAllConnections = getAllConnections;
function getAllSecurityAssessments(callback) {
    var get_all_nodes_query = 'SELECT * FROM security_assessment;';
    connection.query(get_all_nodes_query, function (err, results, fields) {
        if (err) {
            console.log(err);
            throw err;
        }
        var res = JSON.parse(JSON.stringify(results));
        return callback(res);
    });
}
exports.getAllSecurityAssessments = getAllSecurityAssessments;
// [ "port:protocol", "port:protocol" ] 
function getNodesNonNullPort(callback) {
    var get_nodes_non_null = 'SELECT public_key, ip, ports FROM node WHERE ports IS NOT NULL;';
    connection.query(get_nodes_non_null, function (err, results, fields) {
        if (err) {
            console.log(err.message);
            throw err;
        }
        var res = JSON.parse(JSON.stringify(results));
        return callback(res);
    });
}
exports.getNodesNonNullPort = getNodesNonNullPort;
function insertPorts(node) {
    var insert_query = 'INSERT INTO node (IP, public_key, ports, protocols) VALUES (\'' +
        node.ip + '\', \'' +
        node.public_key + '\', \'' +
        node.ports + '\', \'' +
        node.protocols + '\') AS new ON DUPLICATE KEY UPDATE IP=new.IP, public_key=new.public_key, ports=new.ports, protocols=new.protocols;';
    connection.query(insert_query, function (err, results, fields) {
        if (err) {
            console.log(err);
            throw err;
        }
    });
}
exports.insertPorts = insertPorts;
