import * as schedule from "node-schedule";
import NmapInterface from "./nmapInterface";
import Logger from "./logger";
import * as dbCon from "./db_connection/db_helper";
import {
    NodePorts,
    NodePortsProtocols,
    NodePortsNull,
} from "./db_connection/models/node";



//How aggressive is our Short Scan
const T_LEVEL_SHORT: number = 3;

//How aggressive is our Long Scan
const T_LEVEL_LONG: number = 4;

//Affects how many short scans are ran at the same time
const MAX_SHORT_SCANS: number = 2;

//Affects how many ip addresses are fed to NMAP for the long scan
const MAX_LONG_SCANS: number = 4;

//How many days do we wait until next short scan
const DAYS_BETWEEN_SHORT_SCANS: number = 2;

//How many minutes we wait before doing the next long scan
const MINUTES_BETWEEN_LONG_SCANS: number = 10;

//When do we timeout on a short scan
const TIMEOUT_SHORT_SCAN: string = "10m";

//When do we timeout on a long scan
const TIMEOUT_LONG_SCAN: string = "24h";

//For the short scan we check the top N ports (defined by this variable)
const TOP_PORTS = 2000;

//Do or do not long scans... There is no try.
const DO_LONG_SCAN = false;

const VERBOSE_LEVEL = 0;

interface ProtocolPortid {
    protocol: string;
    portid: string;
}

interface Node {
    ip: string;
    openPorts: ProtocolPortid[];
    up: boolean;
}

class PortScan {
    shortScanList: NodePorts[];
    nmapInterface: NmapInterface;
    constructor(nmmpintrf: NmapInterface) {
        this.nmapInterface = nmmpintrf;
        this.shortScanList = [];
    }

    setList(lst: NodePorts[]){
        this.shortScanList = lst;
    }
    /**
     * getRandomDate is used to schedule the next batch of scans in a pseudo random manner for the next day
     * @param increaseInDays how many days from now should the returned date be
     * @returns Date object with incremented day by x and random hour and minutes
     */
    getRandomDate(increaseInDays: number) {
        var datetime = new Date();
        datetime.setDate(datetime.getDate()+increaseInDays);
        datetime.setHours(Math.floor(Math.random()*23));
        datetime.setMinutes(Math.floor(Math.random()*60));
        //datetime.setMinutes(datetime.getMinutes() + 2);
        console.log("NEXT SCAN FOR " + datetime);
        return datetime;
    }

    /**
     * Schedules a short scan of the second kind (where several scans run together)
     */
    scheduleAShortScanver2() {
        const job = schedule.scheduleJob(this.getRandomDate(2), () => {
            console.log("- - - BEGINNING  SHORT PORT  SCAN - - -");
            if(DO_LONG_SCAN){
                dbCon.getNodesNonNullPort().then((result) => {
                    this.shortScanList = result;
                    this.shortScanver2(0);
                }).catch((err: Error) => {
                    Logger.error(err.message);
                });
            }else{
                dbCon.getAllNodesForPortScan().then((result) => {
                    this.shortScanList = result;
                    this.shortScanver2(0);
                }).catch((err: Error) => {
                    Logger.error(err.message);
                });
            }
        });
    }

    /**
     * Schedules a long scan
     */
    scheduleALongScan() {
        const job = schedule.scheduleJob(this.getRandomDate(2), () => {
            console.log("- - - BEGINNING  LONG  PORT  SCAN - - -");
            dbCon.getNullPortNodes().then((result) => {
                this.longScan(result).then(() => this.scheduleALongScan());
            }).catch((err: Error) => {
                Logger.error(err.message);
            });
        });
    }
    
    //IPv6 mapped IPv4 addresses don't work in the Docker for some reason:
    normaliseIP(ip: string){
        if(ip.startsWith("::ffff:")){
            Logger.info("haha")
            ip=ip.substring(7);
            console.log(ip)
        }
        return ip;
    }

    /**
     * The actual long scan
     * @param listOfNodes the list of nodes with null ports in db
     */
    async longScan(listOfNodes: NodePortsNull[]) {
        var n = 0;
        var indexArrayForIPv6 = [];
        while (n < listOfNodes.length) {
            var i = 0;
            var listOfIpS = "";
            var mp = new Map();
            while (n < listOfNodes.length && i < MAX_LONG_SCANS) {
                if (this.normaliseIP(listOfNodes[n].ip).includes(":")) {
                    indexArrayForIPv6.push(n);
                } else {
                    listOfIpS += this.normaliseIP(listOfNodes[n].ip) + " ";
                    mp.set(this.normaliseIP(listOfNodes[n].ip), listOfNodes[n].public_key);
                    i++;
                }

                n++;
            }

            var out: Node[] | null = await this.nmapInterface.checkBulk(listOfIpS, true, T_LEVEL_LONG, TIMEOUT_LONG_SCAN);
            if (out != null) {
                for (var node in out) {
                    if (out[node].up) {
                        var stringForDBports = "";
                        var stringForDBprotocols = "";
                        if (out[node].openPorts.length > 0) {
                            stringForDBports = out[node].openPorts[0].portid;
                            stringForDBprotocols =
                                out[node].openPorts[0].protocol;
                            var i = 1;
                            while (i < out[node].openPorts.length) {
                                stringForDBports +=
                                    "," + out[node].openPorts[i].portid;
                                stringForDBprotocols +=
                                    "," + out[node].openPorts[i].protocol;
                                i++;
                            }
                        }
                        var putin: NodePortsProtocols = {
                            ip: out[node].ip,
                            public_key: mp.get(out[node].ip),
                            ports: stringForDBports,
                            protocols: stringForDBprotocols,
                        };
                        dbCon.insertPorts(putin).catch((err: Error) => {
                            Logger.error(err.message);
                        });
                        console.log(putin);
                    }
                }
            }
        }

        // Need to split IPv6 from IPv4 as otherwise NMAP won't work. This section deals with the IPv6 section
        var n = 0;
        while (n < indexArrayForIPv6.length) {
            var mp = new Map();
            var i = 0;
            var listOfIpS = "";
            while (n < indexArrayForIPv6.length && i < MAX_LONG_SCANS) {
                listOfIpS += listOfNodes[indexArrayForIPv6[n]].ip + " ";
                mp.set(
                    listOfNodes[indexArrayForIPv6[n]].ip,
                    listOfNodes[indexArrayForIPv6[n]].public_key
                );
                i++;
                n++;
            }

            var out: Node[] | null = await this.nmapInterface.checkBulk(listOfIpS, false, T_LEVEL_LONG, TIMEOUT_LONG_SCAN);
            console.log(out);
            if (out != null) {
                for (var node in out) {
                    if (out[node].up) {
                        var stringForDBports = "";
                        var stringForDBprotocols = "";
                        if (out[node].openPorts.length > 0) {
                            stringForDBports = out[node].openPorts[0].portid;
                            stringForDBprotocols =
                                out[node].openPorts[0].protocol;
                            var i = 1;
                            while (i < out[node].openPorts.length) {
                                stringForDBports +=
                                    "," + out[node].openPorts[i].portid;
                                stringForDBprotocols +=
                                    "," + out[node].openPorts[i].protocol;
                                i++;
                            }
                        }
                        var putin: NodePortsProtocols = {
                            ip: out[node].ip,
                            public_key: mp.get(out[node].ip),
                            ports: stringForDBports,
                            protocols: stringForDBprotocols,
                        };
                        console.log(putin);
                        dbCon.insertPorts(putin).catch((err: Error) => {
                            Logger.error(err.message);
                        });
                    }
                }
            }
            console.log("finished.");
        }
        console.log("out of cycle.");
    }
    /**
     * Creates the promises that the second version of the short port scanner uses
     * @param ip the index of the entry from the list this promise will scan
     * @returns A promise object, which resolves to boolean (whether the scan was successful)
     */
    async shortScanPromiseMaker(ip: number) {
        return new Promise<boolean>(async (resolve) => {
            var listOfNodes = this.shortScanList;
            if (ip >= listOfNodes.length) resolve(false);

            var mapUnique = new Map();

            var outPorts: string = "";
            var outProtocols: string = "";
            //console.log("First Scan")
            var flag = 0;
            var success1 = false;
            var success2 = false;
            var portsToCheck=listOfNodes[ip].port;
            //var portsToCheck = "";
            if(listOfNodes[ip].ports && listOfNodes[ip].ports!=null && listOfNodes[ip].ports!=""){
                portsToCheck+=","+listOfNodes[ip].ports;
            }
            let out1: Node | null = await this.nmapInterface.checkSpecificports(
                this.normaliseIP(listOfNodes[ip].ip),
                T_LEVEL_SHORT,
                TIMEOUT_SHORT_SCAN,
                portsToCheck
            );
            //Checks if the scan succeed
            if (out1 != null && out1 && out1.up) {
                var i: number = 0;
                if (out1.openPorts.length > 0) {
                    mapUnique.set(
                        out1.openPorts[i].portid,
                        out1.openPorts[i].portid
                    );
                    outPorts = out1.openPorts[i].portid;
                    outProtocols = out1.openPorts[i].protocol;
                    i++;
                    flag = 1;
                }
                while (i < out1.openPorts.length) {
                    mapUnique.set(
                        out1.openPorts[i].portid,
                        out1.openPorts[i].portid
                    );
                    outPorts += "," + out1.openPorts[i].portid;
                    outProtocols += "," + out1.openPorts[i].protocol;
                    i++;
                }
                success1 = true;
            }

            console.log("Second scan")

            var out2 = await this.nmapInterface.topPortsScan(this.normaliseIP(listOfNodes[ip].ip), TIMEOUT_SHORT_SCAN, T_LEVEL_SHORT, TOP_PORTS);
            //Checks if the scan succeed
            if (out2 != null && out2 && out2.up) {
                var i: number = 0;
                if (flag == 0) {
                    outPorts = out2.openPorts[i].portid;
                    outProtocols = out2.openPorts[i].protocol;
                    i++;
                }

                while (i < out2.openPorts.length) {
                    if (mapUnique.has(out2.openPorts[i].portid)) {
                        console.log("Duplicate " + out2.openPorts[i].portid);
                    } else {
                        outPorts += "," + out2.openPorts[i].portid;
                        outProtocols += "," + out2.openPorts[i].protocol;
                    }
                    i++;
                }
                success2 = true;
            }

            //If either scan has succeeded, put information in databse
            if (success2 || success1) {
                console.log(listOfNodes[ip].ip + " " + outPorts);
                var putin: NodePortsProtocols = {
                    ip: listOfNodes[ip].ip,
                    public_key: listOfNodes[ip].public_key,
                    ports: outPorts,
                    protocols: outProtocols,
                };
                Logger.info("putting in "+outPorts+" and "+outProtocols+" for "+listOfNodes[ip].ip)
                dbCon.insertPorts(putin).catch((err: Error) => {
                    Logger.error(err.message);
                });
                resolve(true);
                return;
                // listOfIPs[ip].openPorts = out;
            } else {
                //Both scans failed. Either node is down or is blocking us.
                console.log("Host may be down " + listOfNodes[ip].ip);
                resolve(false);
                return;
            }
        });
    }

    /**
     * The second version of the short scan. Runs several short scans as defined by {@link MAX_SHORT_SCANS}
     * @param ip the index of the node from the list we should start from in this batch
     * @returns void promise
     */
    async shortScanver2(ip: number) {
        if (ip >= this.shortScanList.length) {
            this.scheduleAShortScanver2();
            //console.log("finished batch")
            return;
        }

        var promiseArr = [];

        //We should keep the number of scans low as once I made 20 promises for nmap scans and crashed my linux
        for (
            var i = 0;
            ip < this.shortScanList.length && i < MAX_SHORT_SCANS;
            i++
        ) {
            promiseArr.push(this.shortScanPromiseMaker(ip));
            ip++;
        }
        //this pattern is from the Geo Locator. We need to wait for this batch to complete before issuing the next one.
        Promise.all(promiseArr).then((value: boolean[]) => {
            //True if success, false otherwise
            //console.log(value);
            //recursive call to this function with the incremented ip count.
            this.shortScanver2(ip);
        });
    }
    

    

    start() {
        Logger.info("PORT SCANNER STARTED")

        if(DO_LONG_SCAN){
            dbCon.getNodesNonNullPort().then((result) => {
                this.shortScanList = result;
                this.shortScanver2(0);
            }).catch((err: Error) => {
                Logger.error(err.message);
            });
            dbCon.getNullPortNodes().then((result) => {
                this.longScan(result).then(() => this.scheduleALongScan());
            }).catch((err: Error) => {
                Logger.error(err.message);
            });
        }else{
            //If we aren't doing a long scan, get all nodes and run short scan on it
            dbCon.getAllNodesForPortScan().then(( result) => {
                this.shortScanList = result;
                this.shortScanver2(0);
            }).catch((err: Error) => {
                Logger.error(err.message);
            });
            // this.shortScanList = data;
            // this.shortScanver2(0);
        }
        //this.longScan(data2).then(() => this.scheduleALongScan());
        // this.shortScanList = data;
        // this.shortScanver2(0);
    }
}
//Debug:
// var test = new PortScan();
// test.start();
export default PortScan;

/*
 New Node added - FULL SCAN (~ 4 hours)
 Open Ports - Most common + any open ports we found
*/



//DEBUG DATA:

const data: NodePorts[] = [
    { ip: "194.35.86.10", public_key: "pk", ports: "404", port: "51235" },
    { ip: "::ffff:95.217.36.126", public_key: "pk", ports: "42,23", port: "51325" },
    { ip: "91.12.98.74", public_key: "pk", ports: "42,23", port: "51235" },
    { ip: "::ffff:35.184.126.128", public_key: "pk", ports: "", port: "51325" },
];
const data2: NodePortsNull[] = [
    { ip: "::ffff:35.184.126.128", public_key: "pk" },
    { ip: "209.195.2.50", public_key: "pk" },
    { ip: "91.12.98.74", public_key: "pk" },
    { ip: "127.0.0.1", public_key: "pk" },
    { ip: "::ffff:93.115.27.128", public_key: "" },
];