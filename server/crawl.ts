"use strict";
import { RippleAPI } from 'ripple-lib';

class Crawler {
    rippleApi?: RippleAPI;

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
                this.rippleApi = new RippleAPI({
                    server: server
                });
                break;
            } catch (err) {
                console.log("Server \"" + server + "\" has wrong format. " + err);
                continue;
            }
        }
        if (this.rippleApi === undefined) {
            throw "RippleServersUrlWrongFormat";
        }
    }
}

export default Crawler;
