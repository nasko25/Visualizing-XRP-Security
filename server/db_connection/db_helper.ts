import { Node, NodePortsNull, NodeIpKeyPublisher } from "./models/node";
import { Node as CrawlerNode } from "../crawl";
import { Validator } from "../validators";
import { NodePorts, NodePortsProtocols } from "./models/node";
import { Connection } from "./models/connection";
import { SecurityAssessment } from "./models/security_assessment";
import ValidatorAssessment from "./models/validator_assessment";
import { ValidatorStatistics } from "../validator_monitor";
import { ValidatorStatisticsTotal } from "../validator_trust_assessor";
import Logger from "../logger";
import e from "express";
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "db",
    port: "3306",
    user: "root",
    password: "pass",
    database: "db",
});

export const insertNode = (node: CrawlerNode): Promise<void> => {
    var insert_node_query: string =
        "INSERT INTO node (IP, portRunningOn,rippled_version, public_key, uptime) VALUES (NULLIF('" +
        node.ip +
        "', 'undefined'), '" +
        node.port +
        "', '" +
        node.version +
        "', '" +
        node.pubkey +
        "', '" +
        node.uptime +
        "') AS new ON DUPLICATE KEY UPDATE IP=NULLIF(new.IP, 'undefined'), rippled_version=new.rippled_version, uptime=new.uptime;";

    return send_insert_request(insert_node_query);
};

export function insertNodes(nodes: CrawlerNode[]): Promise<void> {
    // TODO nodes are never removed from the database
    var insert_nodes_query =
        "INSERT INTO node (IP, portRunningOn, rippled_version, public_key, uptime, publisher) VALUES ? AS new ON DUPLICATE KEY UPDATE IP=NULLIF(new.IP, 'undefined'), rippled_version=new.rippled_version, uptime=new.uptime, publishers=NULLIF(new.publisher, 'undefined');";
    var vals = nodes.map((node) => [
        node.ip,
        node.port,
        node.version,
        node.pubkey,
        node.uptime,
        node.publishers === undefined || node.publishers.length === 0
            ? null
            : JSON.stringify(node.publishers),
    ]);

    // connection.query(query, [vals], create_query_callback_no_return(callback));
    return send_insert_request_vals(insert_nodes_query, vals);
}

// insert longitude and latitude for a given ip address
// the function expects a tuple of longitude and latitude
export function insertLocation(loc: number[], ip: string): Promise<void> {
    const insert_location_query =
        "UPDATE node SET longtitude = ?, latitude = ? where IP = ?;";
    const vals = loc
        .map((coordinate) => {
            // if the location is not known, save it as null
            // otherwise, convert it to a string (because longitude and latitude are numbers)
            if (coordinate === null) return null;
            else return String(coordinate);
        })
        .concat(ip);

    // connection.query(query, vals, create_query_callback_no_return(callback));
    return send_insert_request_vals(insert_location_query, vals);
}

export const updateVersionUptimeAndPublisher = (node: CrawlerNode) => {
    const update_node_query =
        "UPDATE node SET rippled_version = ?, uptime = ?, publishers = ? WHERE public_key = ?";
    const vals = [
        node.version,
        node.uptime,
        node.publishers === undefined || node.publishers.length === 0
            ? null
            : JSON.stringify(node.publishers),
        node.pubkey,
    ];

    return send_insert_request_vals(update_node_query, vals);
};

export const insertConnection = (
    start_node: CrawlerNode,
    end_node: CrawlerNode
): Promise<void> => {
    var insert_connection_query: string =
        "INSERT INTO connection (start_node, end_node) VALUES ('" +
        start_node.pubkey +
        "', '" +
        end_node.pubkey +
        "') AS new ON DUPLICATE KEY UPDATE start_node = new.start_node, end_node = new.end_node;";
    // connection.query(insert_connection_query, create_query_callback_no_return(callback));
    return send_insert_request(insert_connection_query);
};

export function insertSecurityAssessment(
    security_assessment: SecurityAssessment
): Promise<void> {
    var insert_sa_query: string =
        "INSERT INTO security_assessment (public_key, metric_version, score) VALUES ('" +
        security_assessment.public_key +
        "', '" +
        security_assessment.metric_version +
        "', '" +
        security_assessment.score +
        "');";

    // connection.query(insert_sa_query, create_query_callback_no_return(callback));
    return send_insert_request(insert_sa_query);
}

export function insertPorts(node: NodePortsProtocols): Promise<void> {
    const insert_ports_query =
        "UPDATE node SET ports = " +
        node.ports +
        ", protocols = " +
        node.protocols +
        " where public_key = " +
        node.public_key +
        ";";
    return send_insert_request(insert_ports_query);
}

export function getAllNodes(): Promise<Node[]> {
    var get_all_nodes_query = "SELECT * FROM node;";
    return send_select_request<Node>(get_all_nodes_query);
}

// this function will return the IPs of nodes that do not have geolocation yet
// it will ignore NULL IPs
export function getAllNodesWithoutLocation(): Promise<{ IP: string }[]> {
    var get_all_nodes_without_location_query =
        "SELECT IP FROM node WHERE IP IS NOT NULL AND (longtitude IS NULL OR latitude IS NULL);";
    // connection.query(get_all_nodes_without_location_query, create_query_callback(callback));
    return send_select_request<{ IP: string }>(
        get_all_nodes_without_location_query
    );
}

export function getAllConnections(): Promise<Connection[]> {
    var get_all_connections_query = "SELECT * FROM connection;";
    // connection.query(get_all_nodes_query, create_query_callback(callback));
    return send_select_request<Connection>(get_all_connections_query);
}

export function getAllSecurityAssessments(): Promise<SecurityAssessment[]> {
    var get_all_security_assessments_query =
        "SELECT * FROM security_assessment;";
    return send_select_request<SecurityAssessment>(
        get_all_security_assessments_query
    );
}

// [ "port:protocol", "port:protocol" ]
export function getNodesNonNullPort(): Promise<NodePorts[]> {
    var get_nodes_non_null =
        "SELECT public_key, ip, ports FROM node WHERE ports IS NOT NULL;";
    return send_select_request<NodePorts>(get_nodes_non_null);
}

export function getAllNodesForPortScan(): Promise<NodePorts[]> {
    var get_nodes_non_null =
        "SELECT public_key, ip, ports FROM node WHERE ip IS NOT NULL;";
    return send_select_request<NodePorts>(get_nodes_non_null);
}

export function getNullPortNodes(): Promise<NodePortsNull[]> {
    var get_nodes_non_null =
        "SELECT public_key, ip FROM node WHERE ports IS NULL;";
    return send_select_request<NodePortsNull>(get_nodes_non_null);
}

export function getHistoricalData(
    public_key: String,
    duration: Number
): Promise<SecurityAssessment[]> {
    var get_historical_data =
        'SELECT * FROM security_assessment WHERE public_key = "' +
        public_key +
        `\" and timestamp >= DATE_SUB(NOW(),INTERVAL "${duration}" MINUTE);`;
    Logger.info(get_historical_data);
    return send_select_request<SecurityAssessment>(get_historical_data);
}

export function getNodeOutgoingPeers(
    public_key: string
): Promise<Connection[]> {
    const get_node_outgoing_peers =
        'SELECT end_node FROM connection WHERE start_node="' +
        public_key +
        '";';
    return send_select_request<Connection>(get_node_outgoing_peers);
}

export function getValidatorHistoricalData(
    public_key: string,
    duration: number
): Promise<ValidatorAssessment[]> {
    const get_validator_history = `SELECT * FROM validator_assessment WHERE public_key="${public_key}" and timestamp >= DATE_SUB(NOW(),INTERVAL "${duration}" MINUTE);`;
    return send_select_request<ValidatorAssessment>(get_validator_history);
}

export function getNode(public_key: string): Promise<Node[]> {
    const get_node =
        `SELECT * FROM node WHERE public_key=\'` + public_key + `\';`;
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
        );
    });
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
        );
    });
}

function send_insert_request_vals(request: string, vals: any): Promise<void> {
    return new Promise(function (resolve, reject) {
        connection.query(
            request,
            vals,
            function (err: Error, results: JSON[], fields: JSON) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
}

export function getIpAddresses() {
    const get_ip_addresses =
        'SELECT IP, public_key, publishers FROM node WHERE IP is not null and IP <> "undefined" and publishers <> "undefined" and publishers is not null';
    return send_select_request<NodeIpKeyPublisher>(get_ip_addresses);
}

export function insertValidators(validators: Validator[]) {
    const query =
        "INSERT INTO validator (public_key, unl, missed_ledgers) VALUES ? AS new ON DUPLICATE KEY UPDATE unl=new.unl, missed_ledgers=new.missed_ledgers;";
    const vals = validators.map((validator) => [
        validator.public_key,
        validator.unl,
        validator.missed_ledgers,
    ]);

    return send_insert_request_vals(query, [vals]);
}

export function getValidators(): Promise<Validator[]> {
    const query = "SELECT * FROM validator";
    return send_select_request<Validator>(query);
}

export function insertValidatorsAssessments(
    assessments: ValidatorAssessment[]
) {
    const query =
        "INSERT INTO validator_assessment (public_key, trust_metric_version, score) VALUES ? AS new ON DUPLICATE KEY UPDATE trust_metric_version=new.trust_metric_version, score=new.score;";
    const vals = assessments.map((assessment) => [
        assessment.public_key,
        assessment.trust_metric_version,
        assessment.score,
    ]);

    return send_insert_request_vals(query, [vals]);
}

// this function will return the hourly validators statistics grouped by the node's public key
// so it returns an array of { public_key: string, hourly_stats: [{ missed: number, total: number }] }
export function getValidatorsStatistics(): Promise<ValidatorStatisticsTotal[]> {
    // the getStatistics() sql procedure will get the hourly statistics of each validator, grouped by the validator's key
    // if there is more that 7 days worth of data, getStatistics() will sum the `total` and `missed` variables and group them to provide
    // a daily instead of hourly score
    const query = "call getStatistics();";
    //const query = "call db.getStatistics();";
    //const query = "SELECT public_key, GROUP_CONCAT(total) AS total, GROUP_CONCAT(missed) as missed FROM validator_statistics GROUP BY public_key;";

    // send the query and parse the results because they will be returned like this:
    //  {
    //      public_key: 'nHUvzia57LRXr9zqnYpyFUFeKvis2tqn4DkXBVGSppt5M4nNq43C',
    //      total: '0,0,0,0,0,3,6,9,12',
    //      missed: '0,0,0,0,0,0,0,0,0'
    //  }
    return new Promise(function (resolve, reject) {
        connection.query(
            query,
            function (
                err: Error,
                results: ValidatorStatistics[][],
                fields: JSON
            ) {
                if (err) {
                    reject(err);
                } else {
                    const validatorStatisticsTotal: ValidatorStatisticsTotal[] =
                        [];
                    results[0].forEach((row) => {
                        validatorStatisticsTotal.push(<
                            ValidatorStatisticsTotal
                        >{
                            public_key: row.public_key,
                            missed: row.missed
                                .toString()
                                .split(",")
                                .map((value) => {
                                    return Number(value);
                                }),
                            total: row.total
                                .toString()
                                .split(",")
                                .map((value) => {
                                    return Number(value);
                                }),
                        });
                    });
                    //resolve(JSON.parse(JSON.stringify(validatorStatisticsTotal)));
                    resolve(validatorStatisticsTotal);
                }
            }
        );
    });
}

export function insertValidatorsStatistics(
    validatorsStatistics: ValidatorStatistics[]
) {
    const query =
        "INSERT INTO validator_statistics (public_key, total, missed) VALUES ?;";
    const vals = validatorsStatistics.map((validatorStats) => [
        validatorStats.public_key,
        validatorStats.total,
        validatorStats.missed,
    ]);

    return send_insert_request_vals(query, [vals]);
}

export function insertNodeValidatorConnections(cons: Map<string, Set<string>>) {
    let query = "INSERT IGNORE INTO node_validator VALUES ";
    let nEntries = 0;
    let count = 0;
    cons.forEach((vals) => {
        nEntries += vals.size;
    });

    if (nEntries === 0) {
        return new Promise((res, rej) =>
            rej(new Error("node-validator list was empty"))
        );
    }

    cons.forEach((vals, node) => {
        if (vals.size !== 0) {
            vals.forEach((valKey) => {
                query += `("${node}", "${valKey}")`;
                count++;
                if (nEntries === count) {
                    query += ";";
                } else {
                    query += ",";
                }
            });
        }
    });

    return send_insert_request(query);
}
