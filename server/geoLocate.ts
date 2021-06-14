import axios from 'axios';
import config from './config/config.json';
import { getAllNodesWithoutLocation, insertLocation } from './db_connection/db_helper';
import Logger from './logger';

// only load the geoip-lite module if it will be used
// (it can be configured in `config/config.json` by setting `useIPStack` to false)
let geoip: any;
if (!config.useIPStack)
    geoip = require('geoip-lite');

class GeoLocate {
    IPList: string[];
    DBRequestResolved = true;

    // configurable from the config.json file
    useIPStack = false;

    // if you pass a list of IPs to the constructor, the GeoLocator will find only their geolocation
    // if you do not pass anything to the constructor, the GeoLocator will get all IPs that have unknown location from the
    //  database, and find their geolocation
    constructor(IPs?: string[]) {
        this.useIPStack = config.useIPStack;
        // if the IPs argument is provided, use the given IPs to get their geoloaction,
        // but if no IPs are provided, get the geolocation of nodes whose geolocation we don't yet know
        this.IPList = IPs || this.getIPsFromDB();
    }

    setIPList(newList: string[]) {
        this.IPList = newList;
    }

    // helper function that gets the IP addresses of nodes that do not have geolocation in the database yet
    getIPsFromDB(): string[] {
        // since requests to the database are asynchronous, we need to set a flag `DBRequestResolved` to false
        //  and then when the request is resolved set it to true
        this.DBRequestResolved = false;
        getAllNodesWithoutLocation().then((nodes) => {
            this.IPList = nodes.map(node => node.IP);
            this.DBRequestResolved = true;
        }).catch((err: Error) => {
            Logger.error(err.message);
        });
        return [];
    }

    async wait(seconds: number) {

        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    async getData(ip: string) {
        // if the useIPStack flag is set to true, use the ipstack.com service to resolve the IPs to a location
        if (this.useIPStack) {
            //access key needed for ipstack api
            const accessKey: string = config.accessKey;
            try {
                let response = await axios({
                    url: 'http://api.ipstack.com/' + ip + '?access_key=' + accessKey,
                    method: 'get',
                    timeout: 8000
                })
                if (response.status == 200) {
                    return [response.data.latitude, response.data.longitude];
                }
                throw new Error('response was not 200');    //sad moments here
            } catch (err) {
                throw new Error(err);
            }
        }
        // otherwise use geoip-lite
        else {
            if (geoip) {
                const location = geoip.lookup(ip);
                // if the location given by geoip is not null, return the latitude and longitude tuple
                if (location)
                    return location.ll;
            }
            // if geoip cannot resolve the geolocation of a given IP, log it to the console and return [null, null]
            console.error(`Cannot get geolocation of IP address ${ip}`);
            return [null, null];
        }
    }
    //Recursively call from callback. This is probably forbidden by the Geneva Convention, but no other way to do it.
    locateHelper(curr: number) {
        if (curr >= this.IPList.length) {
            Logger.info("Finished locating IPs")
            return;
        }
        this.getData(this.IPList[curr]).then(res => {

            // log the [latitude, longitude] tuple
            // console.log(res);
            // insert the longitude and latitude in the database
            insertLocation(res, this.IPList[curr]).catch((err: Error) => {
                Logger.error(err.message);
            });

            //Delay requests by 1 second, so to not get blocked by the API
            // (but only if using ipstack)
            if (this.useIPStack)
                this.wait(1).then((res) => this.locateHelper(curr + 1));
            else
                this.locateHelper(curr + 1);
        }).catch(err => {
            console.error("Geolocator returned an error: ", err);
        });
    }

    locate() {
        // recursively call locate() every 100ms until the database request is resolved
        // if (!this.DBRequestResolved) {
        //     setTimeout(() => { this.locate() }, 100);
        //     return;
        // }
        // if(this.IPList == null || this.IPList.length == 0){
        //     return;
        // }

        // try{
        //     this.locateHelper(0);
        // } catch(e){
        //     console.log(e);
        // }

        getAllNodesWithoutLocation().then((nodes) => {
            this.IPList = nodes.map(node => node.IP);
            this.DBRequestResolved = true;
            if (this.IPList == null || this.IPList.length == 0) {
                return;
            }

            try {
                this.locateHelper(0);
            } catch (e) {
                console.log(e);
            }
        }).catch((err: Error) => {
            Logger.error(err.message);
        });
    }

}

export default GeoLocate;
