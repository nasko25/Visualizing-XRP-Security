"use strict";
// import { RippleAPI } from 'ripple-lib';
import axios from 'axios';
import https from 'https';

// may need to be substituted with a better way of dealing with insecure request
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

class Crawler {
    // rippleApi?: RippleAPI;
    rippleStartingServer = "";

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
                this.rippleStartingServer = server;
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
            // DFS by getting peers from each node

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
                let IPs = response.data.overlay.active.map(x.ip);
                
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

export default Crawler;
