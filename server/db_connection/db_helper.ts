import { Node } from './models/node'
import { Node as CrawlerNode } from "../crawl"
import { NodePorts, NodePortsProtocols } from './models/node'
import { Connection } from './models/connection'
import { SecurityAssessment } from './models/security_assessment'
import { ValidatorAssessment } from './models/validator_assessment';
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

export function insertNode(node: CrawlerNode): void {
    var insert_query: string = 'INSERT INTO node (IP, rippled_version, public_key, uptime) VALUES (NULLIF(\'' +
        node.ip + '\', \'undefined\'), \'' +
        node.version + '\', \'' +
        node.pubkey + '\', \'' +
        node.uptime + '\') AS new ON DUPLICATE KEY UPDATE IP=new.IP, rippled_version=new.rippled_version, uptime=new.uptime;';

    connection.query(insert_query, voidCallback);
}

export function insertNodes(nodes: CrawlerNode[]): void {
    // TODO nodes are never removed from the database
    var query = "INSERT INTO node (IP, rippled_version, public_key, uptime) VALUES ? AS new ON DUPLICATE KEY UPDATE IP=new.IP, rippled_version=new.rippled_version, uptime=new.uptime;";
    var vals = nodes.map(node => [node.ip, node.version, node.pubkey, node.uptime]);

    connection.query(query, [vals], (err: Error, result: object, fields: JSON) => {
        if (err) {
            console.log(err);
            throw err;
        }
    });
}

// insert longitude and latitude for a given ip address
// the function expects a tuple of longitude and latitude
export function insertLocation(loc: number[], ip: string) {
    const query = 'UPDATE node SET longtitude = ?, latitude = ? where IP = ?;'
    const vals = loc.map(coordinate => {
        // if the location is not known, save it as null
        // otherwise, convert it to a string (because longitude and latitude are numbers)
        if (coordinate === null)
            return null;
        else
            return String(coordinate)
    }).concat(ip);

    connection.query(query, vals, (err: Error, result: object, fields: JSON) => {
        if (err) {
            console.log(err);
            throw err;
        }
    });
}

export function insertConnection(start_node: CrawlerNode, end_node: CrawlerNode): void {
    var insert_query: string = 'INSERT INTO connection (start_node, end_node) VALUES (\'' +
        start_node.pubkey + '\', \'' +
        end_node.pubkey + '\') AS new ON DUPLICATE KEY UPDATE start_node = new.start_node, end_node = new.end_node;';

    connection.query(insert_query, function (err: Error, results: any, fields: JSON) {
        if (err) {
            console.log(err);
            throw err;
        }
    });
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

// this function will return the IPs of nodes that do not have geolocation yet
// it will ignore NULL IPs
export function getAllNodesWithoutLocation(callback: (res: { IP: string }[]) => void): void {
    var get_all_nodes_without_location_query = 'SELECT IP FROM node WHERE IP IS NOT NULL AND (longtitude IS NULL OR latitude IS NULL);';
    connection.query(get_all_nodes_without_location_query, function (err: Error, results: JSON[], fields: JSON) {
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
    var get_nodes_non_null = 'SELECT public_key, ip, ports FROM node WHERE ports IS NOT NULL;';
    connection.query(get_nodes_non_null, function(err: Error, results: JSON[], fields: JSON) {

        if (err) {
            console.log(err.message);
            throw err;
        }
        var res: NodePorts[] = JSON.parse(JSON.stringify(results));
        return callback(res);

    });

}

export function insertPorts(node: NodePortsProtocols): void {
    var insert_query: string = 'INSERT INTO node (IP, public_key, ports, protocols) VALUES (\'' +
        node.ip + '\', \'' +
        node.public_key + '\', \'' +
        node.ports + '\', \'' +
        node.protocols + '\') AS new ON DUPLICATE KEY UPDATE IP=new.IP, public_key=new.public_key, ports=new.ports, protocols=new.protocols;';

    connection.query(insert_query, function (err: Error, results: any, fields: JSON) {
        if (err) {
            console.log(err);
            throw err;
        }
    });
}

export function getHistoricalData(callback: (res: SecurityAssessment[]) => void, public_key: String, duration: Number): void {
    var get_historical_data = 'SELECT * FROM security_assessment WHERE public_key = \"' +
        public_key +
        `\" and timestamp >= DATE_SUB(NOW(),INTERVAL "${duration}" MINUTE);`;
    connection.query(get_historical_data, function (err: Error, results: JSON[], fields: JSON) {
        if (err) {
            console.log(err);
            throw err;
        }
        var res = JSON.parse(JSON.stringify(results));
        return callback(res);
    })
}

function create_query_callback<T>(callback: (err: Error, res: T[]) => void): (err: Error, results: JSON[], fields: JSON) => void {
    return function query_callback(err: Error, results: JSON[], fields: JSON) {
       if (err) {
           return callback(err, []);
       }
       let res: T[] = JSON.parse(JSON.stringify(results));
       return callback(err, res);
    };
}

export function getNodeOutgoingPeers(public_key: string, callback: (err: Error, res: Connection[]) => void): void {
   const get_node_outgoing_peers = "SELECT end_node FROM connection WHERE start_node=\"" + public_key + "\";";
   connection.query(get_node_outgoing_peers, create_query_callback(callback));

}


export function getValidatorHistoricalData(public_key: string, duration: number, callback: (err: Error, res: ValidatorAssessment[]) => void): void {
    const get_validator_history = `SELECT * FROM validator_assessment WHERE public_key="${public_key}" and timestamp >= DATE_SUB(NOW(),INTERVAL "${duration}" MINUTE);`;
    connection.query(get_validator_history, create_query_callback(callback)); 
}
