"use strict";
// import { RippleAPI } from 'ripple-lib';
import axios from 'axios';
import https from 'https';

// may need to be substituted with a better way of dealing with insecure request
// In order to make https requests to servers given only their IPs, we need to ignore the SSL certificate
// (because the certificate is signed for the URL of the server, but the stock nodes gives us only the IPs of their peers)
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

interface Node {
    ip: string;
    port: Number;
    version: string;
    pubkey: string;
    uptime: Number;
}

class Crawler {
    // rippleApi?: RippleAPI;
    rippleStartingServer = "";
    rippleStartingServerIP = "";
    DEFAULT_PEER_PORT = 51235;

    // takes a list of rippled servers to start the crawling process from
    // the list can be configured by modifying the config/ripple_servers.list file
    constructor(rippleServers: string[]) {
        if (rippleServers === undefined || rippleServers.length === 0) {
            console.error("The list of servers cannot be empty.");
            throw "EmptyArrayException";
        }
        // try to use every server in the list of ripple servers, and use the first one that does not throw an error
        for (let server of rippleServers) {
            // TODO ensure that the server has a right format; choose the first server that is of
            // expected format (ip, ip:port, url, url:port are expected formats)
            this.rippleStartingServerIP = server;
            this.rippleStartingServer = "https://" + server + `:${this.DEFAULT_PEER_PORT}/crawl`;
            break;
        }
    }

    crawl() {
        // start from first node, which is chosen from the config/ripple_servers.list
        // perform a BFS by getting peers from each node

        // perform a get request to https://<server_ip>:<server:port>/crawl for each node to get its peers
        // for each peer in the list of peers -> perform the same crawl operation
        // keep an array of visited nodes

        // since we are making an https GET request to each of the nodes with their IP, instead of a URL, we need to ignore the SSL certificate:
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        const rippleStartingServerIP = this.rippleStartingServerIP;
        const DEFAULT_PEER_PORT = this.DEFAULT_PEER_PORT;

        // TODO deal with ips with the format: "::ffff:51.15.115.97"
        // get the peers of the inital stock node
        axios.get(this.rippleStartingServer, {httpsAgent : agent})
            .then( async function ( response )  {
                console.log(response.data.overlay.active[0]);

                // keep track of already visited nodes (with a list of their IPs)
                let visited: string[] = [rippleStartingServerIP];
                let node: Node = {
                                    ip: rippleStartingServerIP,
                                    port: DEFAULT_PEER_PORT, 
                                    version: "rippled-" + response.data.server.build_version, 
                                    pubkey: response.data.server.pubkey_node,
                                    uptime: response.data.server.uptime
                                 };
                // save all visited notes (later we will save that list to the database)
                let Nodes: Node[] = [];
                // keep track of what nodes need to be visited
                let ToBeVisited = [node];

                while (ToBeVisited.length != 0) {
                    console.log("\n");
                    console.log(Nodes);
                    console.log("\n");

                    let n = ToBeVisited.shift();
                    if (n !== undefined) {
                        Nodes.push(n);
                        console.log("IP : " + n.ip + "\nPORT: " + n.port);

                        // request the peers of the node and add them to the ToBeVisited list
                        await axios.get("https://" + n.ip + ":" + n.port + "/crawl", {httpsAgent : agent, timeout: 1000})
                            .then(response => {
                                for (let peer of response.data.overlay.active) {
                                    if (peer.ip !== undefined && !visited.includes(peer.ip)) {
                                        visited.push(peer.ip);
                                        ToBeVisited.push(<Node>{ip: peer.ip, port: ((peer.port === undefined) ? DEFAULT_PEER_PORT : peer.port), version: peer.version, pubkey: peer.public_key, uptime: peer.uptime});
                                    } else {
                                        console.log("Peer ip is undefined: " + peer);
                                    }
                                }
                                console.log(ToBeVisited);
                            })
                            .catch(error => {
                                console.log(error);
                            });
                    }
                }

            })
            .catch(error => {
                console.log(error);
            });
    }

}


export default Crawler;
