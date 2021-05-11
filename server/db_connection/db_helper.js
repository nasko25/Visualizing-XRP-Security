"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSecurityAssessments = exports.getAllConnections = exports.getAllNodes = exports.insertSecurityAssessment = exports.insertConnection = exports.insertNodes = exports.insertNode = void 0;
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'db',
    port: '3306',
    user: 'root',
    password: 'pass',
    database: 'db'
});
function insertNode(node) {
    var insert_query = 'INSERT INTO node (IP, rippled_version, public_key, uptime) VALUES (\'' +
        node.ip + '\', \'' +
        node.version + '\', \'' +
        node.pubkey + '\', \'' +
        node.uptime + '\');';
    connection.query(insert_query, function (err, results, fields) {
        if (err) {
            console.log(err);
            throw err;
        }
    });
}
exports.insertNode = insertNode;
function insertNodes(nodes) {
    // TODO nodes are never removed from the database
    var query = "INSERT INTO node (IP, rippled_version, public_key, uptime) VALUES ? AS new ON DUPLICATE KEY UPDATE IP=new.IP, rippled_version=new.rippled_version, uptime=new.uptime;";
    var vals = nodes.map(function (node) { return [node.ip, node.version, node.pubkey, node.uptime]; });
    connection.query(query, [vals], function (err, result, fields) {
        if (err) {
            console.log(err);
            throw err;
        }
    });
}
exports.insertNodes = insertNodes;
function insertConnection(start_node, end_node) {
    var insert_query = 'INSERT INTO connection (start_node, end_node) VALUES (\'' +
        start_node.pubkey + '\', \'' +
        end_node.pubkey + '\');';
    connection.query(insert_query, function (err, results, fields) {
        if (err) {
            console.log(err);
            throw err;
        }
    });
}
exports.insertConnection = insertConnection;
function insertSecurityAssessment(security_assessment) {
    var insert_query = 'INSERT INTO security_assessment (public_key, metric_version, score) VALUES (\'' +
        security_assessment.public_key + '\', \'' +
        security_assessment.metric_version + '\', \'' +
        security_assessment.score + '\');';
    connection.query(insert_query, function (err, results, fields) {
        if (err) {
            console.log(err);
            throw err;
        }
    });
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
