import { Node, NodePortsNull, NodeIpKeyPublisher } from './models/node'
import { Node as CrawlerNode } from "../crawl"
import { NodePorts, NodePortsProtocols } from './models/node'
import { Connection } from './models/connection'
import { SecurityAssessment } from './models/security_assessment'
import { ValidatorAssessment } from './models/validator_assessment';
import Logger from '../logger'
import e from 'express'
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'db',
    port: '3306',
    user: 'root',
    password: 'pass',
    database: 'db'
})

export function insertNode(node: CrawlerNode): Promise<void> {
    var insert_node_query: string = 'INSERT INTO node (IP, rippled_version, public_key, uptime, publisher) VALUES (NULLIF(\'' +
        node.ip + '\', \'undefined\'), \'' +
        node.version + '\', \'' +
        node.pubkey + '\', \'' +
        node.uptime + '\', \'' +
        node.publisher + '\') AS new ON DUPLICATE KEY UPDATE IP=new.IP, rippled_version=new.rippled_version, uptime=new.uptime;';

    return send_insert_request(insert_node_query);
}

export function insertNodes(nodes: CrawlerNode[]): Promise<void> {
    // TODO nodes are never removed from the database
    var insert_nodes_query = "INSERT INTO node (IP, rippled_version, public_key, uptime, publisher) VALUES ? AS new ON DUPLICATE KEY UPDATE IP=new.IP, rippled_version=new.rippled_version, uptime=new.uptime;";
    var vals = nodes.map(node => [node.ip, node.version, node.pubkey, node.uptime]);

    // connection.query(query, [vals], create_query_callback_no_return(callback));
    return send_insert_request(insert_nodes_query);
}

// insert longitude and latitude for a given ip address
// the function expects a tuple of longitude and latitude
export function insertLocation(loc: number[], ip: string): Promise<void> {
    const insert_location_query = 'UPDATE node SET longtitude = ?, latitude = ? where IP = ?;'
    const vals = loc.map(coordinate => {
        // if the location is not known, save it as null
        // otherwise, convert it to a string (because longitude and latitude are numbers)
        if (coordinate === null)
            return null;
        else
            return String(coordinate)
    }).concat(ip);

    // connection.query(query, vals, create_query_callback_no_return(callback));
    return send_insert_request(insert_location_query);
}

export function insertConnection(start_node: CrawlerNode, end_node: CrawlerNode): Promise<void> {
    var insert_connection_query: string = 'INSERT INTO connection (start_node, end_node) VALUES (\'' +
        start_node.pubkey + '\', \'' +
        end_node.pubkey + '\') AS new ON DUPLICATE KEY UPDATE start_node = new.start_node, end_node = new.end_node;';
    // connection.query(insert_connection_query, create_query_callback_no_return(callback));
    return send_insert_request(insert_connection_query);
    
}

export function insertSecurityAssessment(security_assessment: SecurityAssessment): Promise<void> {
    var insert_sa_query: string = 'INSERT INTO security_assessment (public_key, metric_version, score) VALUES (\'' +
        security_assessment.public_key + '\', \'' +
        security_assessment.metric_version + '\', \'' +
        security_assessment.score + '\');';

    // connection.query(insert_sa_query, create_query_callback_no_return(callback));
    return send_insert_request(insert_sa_query);
}

export function insertPorts(node: NodePortsProtocols): Promise<void> {
    const insert_ports_query = 'UPDATE node SET ports = ' + node.ports +
        ', protocols = ' + node.protocols +
        ' where public_key = ' + node.public_key + ';';
    return send_insert_request(insert_ports_query);
}

export function getAllNodes(): Promise<Node[]> {
    var get_all_nodes_query = 'SELECT * FROM node;';
    return send_select_request<Node>(get_all_nodes_query);
}

// this function will return the IPs of nodes that do not have geolocation yet
// it will ignore NULL IPs
export function getAllNodesWithoutLocation(): Promise<{ IP: string }[]> {
    var get_all_nodes_without_location_query = 'SELECT IP FROM node WHERE IP IS NOT NULL AND (longtitude IS NULL OR latitude IS NULL);';
    // connection.query(get_all_nodes_without_location_query, create_query_callback(callback));
    return send_select_request<{ IP: string }>(get_all_nodes_without_location_query);
}

export function getAllConnections():  Promise<Connection[]> {
    var get_all_connections_query = 'SELECT * FROM connection;';
    // connection.query(get_all_nodes_query, create_query_callback(callback));
    return send_select_request<Connection>(get_all_connections_query);
}

export function getAllSecurityAssessments(): Promise<SecurityAssessment[]> {
    var get_all_security_assessments_query = 'SELECT * FROM security_assessment;';
    return send_select_request<SecurityAssessment>(get_all_security_assessments_query);
}

// [ "port:protocol", "port:protocol" ] 
export function getNodesNonNullPort(): Promise<NodePorts[]> {
    var get_nodes_non_null = 'SELECT public_key, ip, ports FROM node WHERE ports IS NOT NULL;';
    return send_select_request<NodePorts>(get_nodes_non_null);
}

export function getAllNodesForPortScan(): Promise<NodePorts[]> {
    var get_nodes_non_null = 'SELECT public_key, ip, ports FROM node WHERE ip IS NOT NULL;';
    return send_select_request<NodePorts>(get_nodes_non_null);
}

export function getNullPortNodes(): Promise<NodePortsNull[]> {
    var get_nodes_non_null = 'SELECT public_key, ip FROM node WHERE ports IS NULL;';
    return send_select_request<NodePortsNull>(get_nodes_non_null);
}

export function getHistoricalData(public_key: String, duration: Number): Promise<SecurityAssessment[]> {
    var get_historical_data = 'SELECT * FROM security_assessment WHERE public_key = \"' +
        public_key +
        `\" and timestamp >= DATE_SUB(NOW(),INTERVAL "${duration}" MINUTE);`;
    Logger.info(get_historical_data);
    return send_select_request<SecurityAssessment>(get_historical_data);
}

export function getNodeOutgoingPeers(public_key: string): Promise<Connection[]> {
    const get_node_outgoing_peers = "SELECT end_node FROM connection WHERE start_node=\"" + public_key + "\";";
    return send_select_request<Connection>(get_node_outgoing_peers);
}

export function getValidatorHistoricalData(public_key: string, duration: number): Promise<ValidatorAssessment[]> {
    const get_validator_history = `SELECT * FROM validator_assessment WHERE public_key="${public_key}" and timestamp >= DATE_SUB(NOW(),INTERVAL "${duration}" MINUTE);`;
    return send_select_request<ValidatorAssessment>(get_validator_history);
}

export function getNode(public_key: string): Promise<Node[]> {
    const get_node = `SELECT * FROM node WHERE public_key=\'` + public_key + `\';`;
    return send_select_request<Node>(get_node);
}

function send_select_request<T>(request: string): Promise<T[]> {
    return new Promise(function (resolve, reject) {
        connection.query(
            request,
            function (err: Error, results: JSON[], fields: JSON) {
                if (err) {
                    reject(err);
                } else {
                    resolve(JSON.parse(JSON.stringify(results)));
                }
            }
        )
    })
}

function send_insert_request(request: string): Promise<void> {
    return new Promise(function (resolve, reject) {
        connection.query(
            request,
            function (err: Error, results: JSON[], fields: JSON) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        )
    })
}

export function getIpAddresses() {
    const get_ip_addresses = 'SELECT IP, public_key, publisher FROM node WHERE IP is not null and IP <> "undefined" and publisher <> "undefined"';
    return send_select_request<NodeIpKeyPublisher>(get_ip_addresses);
}

export function insertValidators(keys: Map<string, null>) {
    let query = "INSERT IGNORE INTO validator VALUES ";
    let count = keys.size;
    let currentCount = 0;
    keys.forEach((val, key) => {
        query = query + `("${key}")` ;
        currentCount++;
        if (currentCount !== count) {
            query += ",";
        }
        else query += ";";
    });
    return send_insert_request(query);
}


export function insertNodeValidatorConnections(cons: Map<string, string[]>) {
    let query = "INSERT IGNORE INTO node-validator VALUES ";
    let nEntries = 0;
    let count = 0;
    cons.forEach(vals => {
        nEntries += vals.length;
    });
    cons.forEach((vals, node) => {
        for (let valKey of vals) {
            query += `("${node}", "${valKey}")`;
            count++;
            if (nEntries === count) {
                query += ";"
            } else {
                query += ","
            }
        }
    });

    return send_insert_request(query);
}