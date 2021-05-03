"use strict";
import { RippleAPI } from 'ripple-lib';

class Crawler {
    rippleApi: RippleAPI;

    // takes a list of rippled servers to start the crawling process from
    // the list can be configured by modifying the config/ripple_servers.list file
    constructor(rippleServers: string[]) {
        if (rippleServers === undefined || rippleServers.length === 0) {
            console.error("The list of servers cannot be empty.");
            throw "EmptyArrayException";
        }
        // TODO try this with each server in the rippleServers array and use the first that works
        this.rippleApi = new RippleAPI({
            server: rippleServers[0]
        });
    }
}

export default Crawler;
