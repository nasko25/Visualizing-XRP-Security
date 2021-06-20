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
import { PeerToSend } from "../client-api";
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "db",
    port: "3306",
    user: "root",
    password: "pass",
    database: "db",
});

/**
 * Inesrts a stock node into the database
 * @param node - The node to insert
 * @returns - A Promise which resolves into void or rejects into error
 */
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

/**
 * Inserts multiple nodes into the databse
 * @param nodes An array of nodes to be inserted
 * @returns A Promise which resolves into void or rejects into error
 */
export function insertNodes(nodes: CrawlerNode[]): Promise<void> {
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

    return send_insert_request_vals(insert_nodes_query, vals);
}

/**
 * Insert longitude and latitude for a given ip address
 * @param loc A numeric array with 2 values - the longitude and latitude
 * @param ip The IP address of the node
 * @returns A Promise which resolves into void or rejects into error
 */
export function insertLocation(loc: number[], ip: string): Promise<void> {
    const insert_location_query =
        "UPDATE node SET latitude = ?, longtitude = ? where IP = ?;";
    const vals = loc
        .map((coordinate) => {
            // if the location is not known, save it as null
            // otherwise, convert it to a string (because longitude and latitude are numbers)
            if (coordinate === null) return null;
            else return String(coordinate);
        })
        .concat(ip);

    return send_insert_request_vals(insert_location_query, vals);
}

/**
 * Updates the information int the database about Version, Uptime and Publishers for a stock node
 * @param node - The node
 * @returns A Promise which resolves into void or rejects into error
 */
export const updateVersionUptimeAndPublisher = (node: CrawlerNode): Promise<void> => {
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

/**
 * Insert a connection between 2 stock nodes into the database
 * @param start_node The start_node of the connection
 * @param end_node The end_node of the connection
 * @returns A Promise which resolves into void or rejects into error
 */
export const insertConnection = (start_node: CrawlerNode, end_node: CrawlerNode): Promise<void> => {
    var insert_connection_query: string =
        "INSERT INTO connection (start_node, end_node) VALUES ('" +
        start_node.pubkey +
        "', '" +
        end_node.pubkey +
        "') AS new ON DUPLICATE KEY UPDATE start_node = new.start_node, end_node = new.end_node;";
    // connection.query(insert_connection_query, create_query_callback_no_return(callback));
    return send_insert_request(insert_connection_query);

}

/**
 * Inserts a security metric calculation into the database
 * @param security_assessment - The calculation to be inserted
 * @returns A Promise which resolves into void or rejects into error
 */
export function insertSecurityAssessment(security_assessment: SecurityAssessment): Promise<void> {
    var insert_sa_query: string = 'INSERT INTO security_assessment (public_key, metric_version, score) VALUES (\'' +
        security_assessment.public_key + '\', \'' +
        security_assessment.metric_version + '\', \'' +
        security_assessment.score + '\');';

    return send_insert_request(insert_sa_query);
}

/**
 * Inserts multiple security metric calculations into the database
 * @param security_assessments An array of SecurityAssessment
 * @returns A Promise which resolves into void or rejects into error
 */
export function insertSecurityAssessments(security_assessments: SecurityAssessment[]): Promise<void> {
    var insert_sa_query: string = 'INSERT INTO security_assessment (public_key, metric_version, score) VALUES ? ON DUPLICATE KEY UPDATE public_key=VALUES(public_key), metric_version=VALUES(metric_version), score=VALUES(score);';
    return send_insert_request_vals(insert_sa_query, [security_assessments.map(assesment => [assesment.public_key, `${assesment.metric_version}`, `${assesment.score}`])]);
}

/**
 * Inserts information about a node's open ports and services running on them in the database
 * @param node The node, with its public_key, ports and protocols
 * @returns A Promise which resolves into void or rejects into error
 */
export function insertPorts(node: NodePortsProtocols): Promise<void> {
    if (node.protocols == "") node.protocols = "\'\'"
    if (node.ports == "") node.ports = "\'\'"
    const insert_ports_query = 'UPDATE node SET ports = ?, protocols = ? where public_key = ?;';
    const vals: string[] = [node.ports, node.protocols, node.public_key];
    return send_insert_request_vals(insert_ports_query, vals);
}

/**
 * Selects all nodes from the database that have been detected by the Network Crawler in the last 10 minutes
 * @returns A Promise which resolves into an array of Node objects or rejects into error
 */
export function getAllNodes(): Promise<Node[]> {
    var get_all_nodes_query = 'SELECT * FROM node WHERE timestamp BETWEEN DATE_SUB(NOW(), INTERVAL 10 MINUTE) AND NOW();';
    return send_select_request<Node>(get_all_nodes_query);
}

type nodeAndScore = {
    rippled_version: string,
    public_key: string,
    uptime: number,
    longtitude: number,
    latitude: number,
    scores: string,
    timestamps: string
}
/**
 * Selects all stock nodes from the database which have been detected by the Network Crawler in the past 10 minutes, 
 * with all of their their security assessments from the past 3 hours. The security_assessments are represented
 * by two fields - scores and timestamps. Scores is a string, consisting of the scores, separated by commas, while
 * timestamps is a string, consisting of the respective timestamps to the scores, separated by commas. 
 * @returns A Promise which resolves into an array of nodeAndScore objects or rejects into error
 */
export function getAllNodesSecurity(): Promise<nodeAndScore[]> {
    var all_security_scores = 
        "Select n.rippled_version, n.public_key, n.uptime, n.longtitude, n.latitude, s.scores, s.timestamps " +
        "FROM (SELECT public_key, GROUP_CONCAT(score) AS scores, GROUP_CONCAT(timestamp) AS timestamps " + 
        "FROM (SELECT * FROM security_assessment WHERE timestamp >= DATE_SUB(NOW(),INTERVAL 10 minute)) " + 
        "AS va GROUP BY public_key) as s join (SELECT * FROM node WHERE timestamp BETWEEN DATE_SUB(NOW(), INTERVAL 3 hour) " + 
        "AND NOW()) as n on n.public_key=s.public_key;";
    return send_select_request<nodeAndScore>(
        all_security_scores
    );
}

/**
 * Select the IPs of stock nodes that do not have geolocation yet.
 * Stock nodes with NULL IPs are ignored. 
 * @returns A Promise which resolves into an array of string objects, representing the IPs or rejects into error
 */
export function getAllNodesWithoutLocation(): Promise<{ IP: string }[]> {
    var get_all_nodes_without_location_query =
        "SELECT IP FROM node WHERE IP IS NOT NULL AND (longtitude IS NULL OR latitude IS NULL);";
    return send_select_request<{ IP: string }>(
        get_all_nodes_without_location_query
    );
}

/**
 * Selects all peer connections between stock nodes from the database
 * @returns A Promise which resolves into an array of Connection objects or rejects into error
 */
export function getAllConnections(): Promise<Connection[]> {
    var get_all_connections_query = "SELECT * FROM connection;";
    return send_select_request<Connection>(get_all_connections_query);
}

/**
 * Selects all security metric calculations from the database
 * @returns A Promise which resolves into an array of SecurityAssessment objects or rejects into error
 */
export function getAllSecurityAssessments(): Promise<SecurityAssessment[]> {
    var get_all_security_assessments_query =
        "SELECT * FROM security_assessment;";
    return send_select_request<SecurityAssessment>(
        get_all_security_assessments_query
    );
}

/**
 * Selects the stock nodes, which have non null ports in the database.
 * For each stock node, a public_key, portRunningOn, IP and open ports are returned.
 * @returns * @returns A Promise which resolves into an array of NodePorts objects or rejects into error
 */
export function getNodesNonNullPort(): Promise<NodePorts[]> {
    var get_nodes_non_null = 'SELECT public_key, portRunningOn, ip, ports FROM node WHERE ports IS NOT NULL;';
    return send_select_request<NodePorts>(get_nodes_non_null);
}

/**
 * Select all stock nodes from the database which have non null IP
 * @returns A Promise which resolves into an array of NodePorts objects or rejects into error
 */
export function getAllNodesForPortScan(): Promise<NodePorts[]> {
    var get_nodes_non_null = 'SELECT public_key, portRunningOn, ip, ports FROM node WHERE ip IS NOT NULL;';
    return send_select_request<NodePorts>(get_nodes_non_null);
}

/**
 * Selects all stock nodes from the database, which have NULL ports.
 * @returns A Promise which resolves into an array of NodePortsNull objects or rejects into error
 */
export function getNullPortNodes(): Promise<NodePortsNull[]> {
    var get_nodes_non_null =
        "SELECT public_key, ip FROM node WHERE ports IS NULL;";
    return send_select_request<NodePortsNull>(get_nodes_non_null);
}

/**
 * Select the the average security score for a stock node for each day for the past 'duration' days
 * @param public_key - The public key of the stock nodes
 * @param duration - How many days back
 * @returns A Promise which resolves into an array of SecurityAssessment objects or rejects into error
 */
export function getHistoricalData(public_key: String, duration: Number): Promise<SecurityAssessment[]> {
    var get_historical_data =
        'SELECT public_key, AVG(score) as average_score, DATE(timestamp) as date FROM security_assessment WHERE public_key = "' +
        public_key +
        `\" and timestamp >= DATE_SUB(NOW(),INTERVAL "${duration}" DAY) ` +
        `GROUP BY DATE(timestamp);`;
    return send_select_request<SecurityAssessment>(get_historical_data);
}

/**
 * Get most recent security assessment for a stock node
 * @param public_key The public_key of the node
 * @returns A Promise which resolves in an array of a single SecurityAssessment or rejects into error
 */
export function getLastSecurityAssessmentsForNode(public_key: string){
    let query = 'SELECT * from security_assessment WHERE public_key = \'' + public_key + '\' ORDER BY timestamp DESC limit 1;';
    return send_select_request<SecurityAssessment>(query);
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

/**
 * Queries the database for all the peers of a node and their scores from the past 10 minutes.
 * This is a quite expensive operation as it requires to join a table containing the peers
 * to the security_assessment table.
 * @param public_key The public_key of the node, who's peers we want to retrieve
 * @returns A Promise, which resolves in a list of PeerToSend objects or rejects into void
 */
export function getPeersWithScores(public_key: string): Promise<PeerToSend[]> {
    const get_peers_with_scores = "SELECT " +
        "end_node as public_key, metric_version, score, timestamp " +
        "FROM " +
        "(SELECT end_node FROM connection WHERE start_node = \"" + public_key + "\") AS peers " +
        "JOIN security_assessment ON peers.end_node = security_assessment.public_key " +
        "where timestamp >= DATE_SUB(NOW(),INTERVAL 10 MINUTE);"
    return send_select_request<PeerToSend>(get_peers_with_scores);
}

/**
 * Select all validator trust score calculations from the past 'duration' days
 * @param public_key The public_key of the validator
 * @param duration How many days in the past 
 * @returns A Promise which resolves into an array of ValidatorAssessment or rejects into error
 */
export function getValidatorHistoricalData(public_key: string, duration: number): Promise<ValidatorAssessment[]> {
    const get_validator_history = `SELECT * FROM validator_assessment WHERE public_key="${public_key}" and timestamp >= DATE_SUB(NOW(),INTERVAL "${duration}" DAY);`;
    return send_select_request<ValidatorAssessment>(get_validator_history);
}

/**
 * Select all validator trust score calculations from the past 'duration' days, average for each day
 * @param public_key The public_key of the validator
 * @param duration How many days in the past 
 * @returns A Promise which resolves into an array of ValidatorAssessment with size `duration` or rejects into error
 */
export function getValidatorHistoricalAvgScore(public_key: string, duration: number): Promise<ValidatorAssessment[]> {
    var get_historical_data =
        'SELECT public_key, AVG(score) as score, DATE(timestamp) as date FROM validator_assessment WHERE public_key = "' +
        public_key +
        `\" and timestamp >= DATE_SUB(NOW(),INTERVAL "${duration}" DAY) ` +
        `GROUP BY DATE(timestamp);`;
    return send_select_request<ValidatorAssessment>(get_historical_data);
}

/**
 * Select information for a stock node, based on its public_key
 * @param public_key - The stock node public_key
 * @returns A Promise, which resolves in a list of Node objects or rejects into void
 */
export function getNode(public_key: string): Promise<Node[]> {
    const get_node =
        `SELECT * FROM node WHERE public_key=\'` + public_key + `\';`;
    return send_select_request<Node>(get_node);
}

export function getIpAddresses() {
    const get_ip_addresses =
        'SELECT IP, public_key, publishers FROM node WHERE IP is not null and IP <> "undefined" and publishers <> "undefined" and publishers is not null';
    return send_select_request<NodeIpKeyPublisher>(get_ip_addresses);
}

/**
 * Inserts a list of validators into the database
 * @param validators - An arry of Validator objects
 * @returns A Promise which resolves into void or rejects into error
 */
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

/**
 * Select all validators from the database
 * @returns A Promise which resolves into an array of Validator or rejects into error
 */
export function getValidators(): Promise<Validator[]> {
    const query = "SELECT * FROM validator";
    return send_select_request<Validator>(query);
}

/**
 * Insert trust scores of validators into the database
 * @param assessments An array of ValidatorAssessments
 * @returns A Promise which resolves into void or rejects into error
 */
export function insertValidatorsAssessments(assessments: ValidatorAssessment[]): Promise<void> {
    const query =
        "INSERT INTO validator_assessment (public_key, trust_metric_version, score) VALUES ? AS new ON DUPLICATE KEY UPDATE trust_metric_version=new.trust_metric_version, score=new.score;";
    const vals = assessments.map((assessment) => [
        assessment.public_key,
        assessment.trust_metric_version,
        assessment.score,
    ]);

    return send_insert_request_vals(query, [vals]);
}

/**
 * Select the hourly validators statistics grouped by the node's public key.
 * It returns an array of { public_key: string, hourly_stats: [{ missed: number, total: number }] }
 * @returns A Promise which resolves into an array of ValidatorStatisticsTotal or rejects into error
 */
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

/**
 * Inserts trust scores of validators into the database
 * @param validatorsStatistics - an array of ValidatorStatistics objects
 * @returns A Promise which resolves into void ot rejects into error
 */
export function insertValidatorsStatistics(validatorsStatistics: ValidatorStatistics[]): Promise<void> {
    const query =
        "INSERT INTO validator_statistics (public_key, total, missed) VALUES ?;";
    const vals = validatorsStatistics.map((validatorStats) => [
        validatorStats.public_key,
        validatorStats.total,
        validatorStats.missed,
    ]);

    return send_insert_request_vals(query, [vals]);
}
/**
 * Inserts the connections between a stock node and it's UNL validators
 * @param cons A Map with keys corresponding to stock node public keys and values - the validators
 * on their UNL
 * @returns A Promise which resolves in void or rejects in error
 */
export function insertNodeValidatorConnections(cons: Map<string, Set<string>>): Promise<void> {
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

/**
 * A type used as a return type for the getALlValidatorAssessments method
 */
type validator_group_assessment = {
    public_key: string,
    scores: string, 
    timestamps: string
}

/**
 * Selects all validator assessments from the database, grouped by public_key, 
 * with timestamps and scores as concatenated strings, separated by commas
 * @returns A Promise which resolves in validator_group_assessment[] or rejects in error
 */
export function getAllValidatorAssessments(): Promise<validator_group_assessment[]> {
    let get_all_validator_assessments_query: string =
        "SELECT public_key, GROUP_CONCAT(score) AS scores, GROUP_CONCAT(timestamp) AS timestamps " +
        "FROM (SELECT * FROM validator_assessment WHERE timestamp >= DATE_SUB(NOW(),INTERVAL 30 DAY)) AS va " +
        "GROUP BY public_key;";
    return send_select_request<validator_group_assessment>(get_all_validator_assessments_query);
}

/**
 * Deletes the connection table. This should happen before each crawl.
 * @returns A Promise which resolves into void or rejects into error
 */
export function emptyConnectionTable(): Promise<void> {
    let emtpy_connection_table_query = "TRUNCATE TABLE connection;";
    return send_insert_request(emtpy_connection_table_query);
}

/**
 * Sends a SELECT request to the database, expecting to return an array
 * of data of type T[]
 * @param request - The query in string format
 * @returns - A Promise which resolves in T[] or rejects in error
 */
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

/**
 * Sends an INSERT or UPDATE request to the database, expecting no return from the database
 * @param request - The query in string format
 * @returns - A Promise which resolves in void or rejects in error
 */
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

/**
 * Sends a INSERT or UPDATE request to the database, expecting no return from the database
 * @param request - The query in string format
 * @param vals - The values to be filled in the request
 * @returns - A Promise which resolves in void or rejects in error
 */
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
        )
    })
}