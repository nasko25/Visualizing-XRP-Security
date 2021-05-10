"use strict";

import axios from 'axios';
import https from 'https';
import { encodeNodePublic } from 'ripple-address-codec';
import { insertNodes } from './db_connection/db_helper'

// May need to be substituted with a better way of dealing with insecure request
// In order to make https requests to servers given only their IPs, we need to ignore the SSL certificate
// (because the certificate is signed for the URL of the server, but the stock nodes gives us only the IPs of their peers)
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Interface used for storage of information while crawling
interface Node {
    ip: string;
    port: Number;
    version: string;
    pubkey: string;
    uptime: Number;
}

// Wait for at most 3 seconds when making an HTTP request to obtain a node's peers
// If the node does not respond after 3 seconds, it is assumed that we cannot retrieve its peer from the peer crawler API
const TIMEOUT_GET_REQUEST = 3000

const normalizePublicKey = function(publicKey: string) {
    if (publicKey.length > 50 && publicKey[0] === 'n')
        return publicKey;

    return encodeNodePublic(Buffer.from(publicKey, 'base64'));
}

class Crawler {

    rippleStartingServer = "";
    rippleStartingServerIP = "";
    // This is the default XRP Peers port that will be used to make an HTTP request to /crawl if the node does not specify a custom port to be used for the peer crawler API
    readonly DEFAULT_PEER_PORT = 51235;

    // Takes a list of rippled servers to start the crawling process from
    // The list can be configured by modifying the config/ripple_servers.list file
    constructor(rippleServers: string[]) {
        if (rippleServers === undefined || rippleServers.length === 0) {
            console.error("The list of servers cannot be empty.");
            throw "EmptyArrayException";
        }
        // Try to use every server in the list of ripple servers, and use the first one that does not throw an error
        for (let server of rippleServers) {
            // TODO ensure that the server has a right format; choose the first server that is of
            // Expected format (ip, ip:port, url, url:port are expected formats)

            // Set initial server's ip to that of the chosen one from the list
            this.rippleStartingServerIP = server;
            // Set starting server's url to that of the chosen one from the list
            this.rippleStartingServer = "https://[" + server + `]:${this.DEFAULT_PEER_PORT}/crawl`;
            break;
        }
    }

    crawl() {
        // Start from first node, which is chosen from the config/ripple_servers.list
        // Perform a BFS by getting peers from each node

        // Perform a get request to https://<server_ip>:<server:port>/crawl for each node to get its peers
        // For each peer in the list of peers -> perform the same crawl operation
        // Keep an array of visited nodes

        // Since we are making a https GET request to each of the nodes with their IP, instead of a URL, we need to ignore the SSL certificate:
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        const rippleStartingServerIP = this.rippleStartingServerIP;
        const DEFAULT_PEER_PORT = this.DEFAULT_PEER_PORT;

        // Get the peers of the initial stock node
        axios.get(this.rippleStartingServer, {httpsAgent : agent})
            .then( async function ( response )  {

                // Keep track of already visited nodes (with a list of their IPs)
                let visited: string[] = [rippleStartingServerIP];

                // Initialize initial node
                let node: Node = {
                                    ip: rippleStartingServerIP,
                                    port: DEFAULT_PEER_PORT, 
                                    version: "rippled-" + response.data.server.build_version,
                                    pubkey: normalizePublicKey(response.data.server.pubkey_node),
                                    uptime: response.data.server.uptime
                                 };

                // The use of map instead of an array saves us the work we have to do later when filtering duplicate public keys
                // Later nodes will be stored in the database
                let Nodes = new Map<String, Node>();
                // Keep track of what nodes need to be visited
                let ToBeVisited = [node];

                while (ToBeVisited.length !== 0) {
                    // FOR DEBUGGING ONLY: STOP THE LOOP WHEN YOU HAVE 200 NODES IN THE LIST
                    //if (Nodes.length === 200) {
                    //    break;
                    //}

                    // Remove first node from the list
                    let n = ToBeVisited.shift();

                    if (n !== undefined) {
                        Nodes.set(n.pubkey, n);
                        //console.log("IP : " + n.ip + "\nPORT: " + n.port);

                        // Request the peers of the node and add them to the ToBeVisited list
                        let getPeersPromise = axios.get("https://[" + n.ip + "]:" + n.port + "/crawl", {httpsAgent : agent, timeout: TIMEOUT_GET_REQUEST})
                            .then(response => {
                                for (let peer of response.data.overlay.active) {
                                    if (peer.ip !== undefined && !visited.includes(peer.ip)) {
                                        visited.push(peer.ip);
                                        ToBeVisited.push(<Node>{ip: peer.ip, port: ((peer.port === undefined) ? DEFAULT_PEER_PORT : peer.port), version: peer.version, pubkey: normalizePublicKey(peer.public_key), uptime: peer.uptime});
                                    } else {
                                        // Push the node that does not have an ip to the map of nodes, as it will not be visited later
                                        let normalizedPublicKey = normalizePublicKey(peer.public_key);
                                        // Ensures that a valid ip is not changed to a undefined ip
                                        if (Nodes.has(normalizedPublicKey)) {
                                            continue;
                                        } else {
                                            Nodes.set(normalizedPublicKey, <Node>{ip: peer.ip, port: ((peer.port === undefined) ? DEFAULT_PEER_PORT : peer.port), version: peer.version, pubkey: normalizedPublicKey, uptime: peer.uptime});
                                        }
                                        //console.log("Peer ip is undefined: " + peer);
                                    }
                                }
                            })
                            .catch(error => {
                                // Uncomment to console log the peers that refuse connection
                                // console.log(error);
                            });
                        // If there are no nodes that can be visited, wait for the "get peers" request to retrieve some new peers that can be crawled
                        // Deals with the http requests being async
                        if (ToBeVisited.length === 0)
                            await getPeersPromise;

                    }
                }
                // console.log(Nodes);
                console.log("How many nodes we have visited: " + visited.length + "\nHow many UNIQUE IPs we have visited: " + visited.filter((item, i, ar) => ar.indexOf(item) === i).length);
                console.log("How many nodes we have saved: " + Nodes.size);

                // save all nodes in the database
                insertNodes(Array.from(Nodes.values());
            })
            .catch(error => {
                console.log(error);
            });
    }

}


export default Crawler;
export { Node };
