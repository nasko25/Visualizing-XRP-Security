"use strict";
// import { RippleAPI } from 'ripple-lib';
import axios from 'axios';
import https from 'https';

// may need to be substituted with a better way of dealing with insecure request
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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
            try {
                // this.rippleApi = new RippleAPI({
                //     server: server
                // });
                this.rippleStartingServerIP = server;
                this.rippleStartingServer = "https://" + server + `:${this.DEFAULT_PEER_PORT}/crawl`;
                break;
            } catch (err) {
                console.log("Server \"" + server + "\" has wrong format. " + err);
                continue;
            }
        }
        // if (this.rippleApi === undefined) {
        //     throw "RippleServersUrlWrongFormat";
        // }

        // this.rippleApi.on('error', (errorCode, errorMessage) => {
        //     console.log(errorCode + ': ' + errorMessage);
        // });

        // this.rippleApi.on('connected', () => {
        //     console.log('connected');
        // });

        // this.rippleApi.on('disconnected', (code) => {
        //     console.log('disconnected, code:', code);
        // });
    }

    crawl() {

        // if (this.rippleApi === undefined) {
        //     throw "Ripple api is undefined";
        // }

            // start from first node
            // BFS by getting peers from each node

            // /crawl first node -> returns peers
            // for each peer in peers -> crawl peer
            // keep an array of visited
        
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        
        axios.get(this.rippleStartingServer, {httpsAgent : agent})
            .then(response => {
                console.log(response.data.overlay.active[0]);
                // fill a list with the peer's ips
                // let IPs = response.data.overlay.active.map(x.ip);

                let visited: string[] = [this.rippleStartingServerIP];
                let node: Node = {ip: this.rippleStartingServerIP, 
                                port: 51235, 
                                version: "rippled-" + response.data.server.build_version, 
                                pubkey: response.data.server.public_key, 
                                uptime: response.data.server.uptime};
                let Nodes: Node[] = [];
                let ToBeVisited = [node];

                // for (let n of response.data.overlay.active) {
                //     // saves nodes with "undefined" ip for later use if such
                //     Nodes.push(<Node>{ip: n.ip, port: n.port, version: n.version, pubkey: n.public_key, uptime: n.uptime});
                //     if (n.ip !== undefined) {
                //         ToBeVisited.push(<Node>{ip: n.ip, port: n.port, version: n.version, pubkey: n.public_key, uptime: n.uptime});
                //         visited.push(n.ip);
                //     }
                // }
                
                console.log(Nodes);
                
                while (ToBeVisited.length != 0) {
                    console.log("\n");
                    console.log(Nodes);
                    console.log("\n");

                    let n = ToBeVisited.shift();
                    if (n !== undefined) {
                        Nodes.push(n);
                        console.log("IP : " + n.ip + "PORT: " + n.port);

                        // request the peers of the node
                        axios.get("https://" + n.ip + ":" + n.port + "/crawl", {httpsAgent : agent})
                            .then(response => {
                                for (let peer of response.data.overlay.active) {
                                    if (peer.ip !== undefined && !visited.includes(peer.ip)) {
                                        visited.push(peer.ip);
                                        ToBeVisited.push(<Node>{ip: peer.ip, port: ((peer.port === undefined) ? this.DEFAULT_PEER_PORT : peer.port), version: peer.version, pubkey: peer.public_key, uptime: peer.uptime});
                                    } else {
                                        console.log("Peer ip is undefined: " + peer);
                                    }
                                }
                                console.log(ToBeVisited);   
                            })
                            .catch(error => {
                                console.log("opaaaa");
                                console.log(error);
                            });
                            console.log("nqma oppaaa");
                    }
                }

            })
            .catch(error => {
                console.log(error);
            });
        
        

        // this.rippleApi.connect().then(() => {
        //   }).then(() => {
        //     if (this.rippleApi === undefined) {
        //         throw "Ripple api is undefined";
        //     }

        //     return this.rippleApi.disconnect();
        //   }).catch(console.error);
    }
    
}

interface Node {
    ip: string;
    port: Number;
    version: string;
    pubkey: string;
    uptime: Number;
}

export default Crawler;
