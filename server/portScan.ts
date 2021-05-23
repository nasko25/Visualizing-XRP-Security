import * as schedule from "node-schedule";
import * as exec from "child_process";
import * as xml2js from "xml2js";
import * as dbCon from "./db_connection/db_helper";
import {
    NodePorts,
    NodePortsProtocols,
    NodePortsNull,
} from "./db_connection/models/node";
var parser = new xml2js.Parser();
const data: NodePorts[] = [
    { ip: "194.35.86.10", public_key: "pk", ports: "404" },
    { ip: "209.195.2.50", public_key: "pk", ports: "42,23" },
    { ip: "91.12.98.74", public_key: "pk", ports: "42,23" },
    { ip: "::ffff:35.184.126.128", public_key: "pk", ports: "" },
];
const data2: NodePortsNull[] = [
    { ip: "::ffff:35.184.126.128", public_key: "pk" },
    { ip: "209.195.2.50", public_key: "pk" },
    { ip: "91.12.98.74", public_key: "pk" },
    { ip: "127.0.0.1", public_key: "pk" },
    { ip: "::ffff:93.115.27.128", public_key: "" },
];

//How aggressive is our Short Scan
const T_LEVEL_SHORT: number = 3;

//How aggressive is our Long Scan
const T_LEVEL_LONG: number = 4;

//Affects how many short scans are ran at the same time
const MAX_SHORT_SCANS: number = 4;

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
    constructor() {
        this.shortScanList = [];
    }

    /**
     * getRandomDate is used to schedule the next batch of scans in a pseudo random manner for the next day
     * @returns Date object with incremented day by x and random hour and minutes
     */
    getRandomDate(increaseInDays: number) {
        var datetime = new Date();
        //datetime.setDate(datetime.getDate()+increaseInDays);
        //datetime.setHours(Math.floor(Math.random()*23));
        //datetime.setMinutes(Math.floor(Math.random()*60));
        datetime.setMinutes(datetime.getMinutes() + 2);
        console.log("NEXT SCAN FOR " + datetime);
        return datetime;
    }

    scheduleAShortScan() {
        const job = schedule.scheduleJob(this.getRandomDate(2), () => {
            console.log("- - - BEGINNING  SHORT PORT  SCAN - - -");
            dbCon.getNodesNonNullPort((result) => {
                this.shortScan(result).then(() => this.scheduleAShortScan());
            });
        });
    }

    /**
     * Schedules a short scan of the second kind (where several scans run together)
     */
    scheduleAShortScanver2() {
        const job = schedule.scheduleJob(this.getRandomDate(2), () => {
            console.log("- - - BEGINNING  SHORT PORT  SCAN - - -");
            dbCon.getNodesNonNullPort((result) => {
                this.shortScanList = result;
                this.shortScanver2(0);
            });
        });
    }

    /**
     * Schedules a long scan
     */
    scheduleALongScan() {
        const job = schedule.scheduleJob(this.getRandomDate(2), () => {
            console.log("- - - BEGINNING  LONG  PORT  SCAN - - -");
            dbCon.getNullPortNodes((result) => {
                this.longScan(result).then(() => this.scheduleALongScan());
            });
        });
    }

    /** NOT USED ANYMORE
     * Given list of ProtocolPortid objects, makes their portids into a comma separated list (was used for the nmap)
     * @param arryOfPortObjects array of objects of {protocol, portid}
     * @returns comma separated list of prots (for example: 22,34,245,5133)
     */
    stringListMaker(arryOfPortObjects: ProtocolPortid[]) {
        if (arryOfPortObjects.length == 0) return null;
        var out = "";
        for (var i = 0; i < arryOfPortObjects.length - 1; i++) {
            out += arryOfPortObjects[i].portid + ",";
        }
        out += arryOfPortObjects[arryOfPortObjects.length - 1].portid;
        return out;
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
                if (listOfNodes[n].ip.includes(":")) {
                    indexArrayForIPv6.push(n);
                } else {
                    listOfIpS += listOfNodes[n].ip + " ";
                    mp.set(listOfNodes[n].ip, listOfNodes[n].public_key);
                    i++;
                }

                n++;
            }

            var out: Node[] | null = await this.checkBulk(listOfIpS, true);
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
                        //dbCon.insertPorts(putin);
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

            var out: Node[] | null = await this.checkBulk(listOfIpS, false);
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
                        //dbCon.insertPorts(putin);
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

            let out1: Node | null = await this.checkSpecificports(
                listOfNodes[ip].ip,
                listOfNodes[ip].ports
            );
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

            //console.log("Second scan")

            var out2 = await this.defScanOfIp(listOfNodes[ip].ip);
            //console.log("done " + out2);
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
                //dbCon.insertPorts(putin);
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

    async shortScanver2(ip: number) {
        if (ip >= this.shortScanList.length) {
            this.scheduleAShortScanver2();
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
            console.log(value);
            this.shortScanver2(ip);
        });
    }
    /** this is the older version of the short scan that does each scan sequentially. Much slower as it has high idle time
     * Given a list of IPs will detect any open ports for them and put relevant information in database
     * @param listOfNodes the list of nodes which we are scanning
     */
    async shortScan(listOfNodes: NodePorts[]): Promise<void> {
        for (var index in listOfNodes) {
            var mapUnique = new Map();
            if (listOfNodes[index].ports === null) continue;
            var outPorts: string = "";
            var outProtocols: string = "";
            //console.log("First Scan")
            var flag = 0;
            var success1 = false;
            var success2 = false;

            let out1: Node | null = await this.checkSpecificports(
                listOfNodes[index].ip,
                listOfNodes[index].ports
            );
            if (out1 !== null && out1 && out1.up) {
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

            //console.log("Second scan")

            var out2 = await this.defScanOfIp(listOfNodes[index].ip);
            //console.log("done " + out2);
            if (out2 !== null && out2 && out2.up) {
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

            if (success2 || success1) {
                console.log(listOfNodes[index].ip + " " + outPorts);
                var putin: NodePortsProtocols = {
                    ip: listOfNodes[index].ip,
                    public_key: listOfNodes[index].public_key,
                    ports: outPorts,
                    protocols: outProtocols,
                };
                dbCon.insertPorts(putin);

                // listOfIPs[ip].openPorts = out;
            } else {
                console.log("Host may be down");
            }
        }
    }

    /**
     * Interpets the XML output from NMAP
     * @param error parameter used in case of an error
     * @param stdout standard out (for successful output) will be in XML
     * @param stderr standard error stream
     * @param resolve function used to resolve the promise
     * @returns void, however will resolve to either null or a Node object (ip, open ports, is it up)
     */
    interpretNmapReturn(
        error: exec.ExecException | null,
        stdout: string,
        stderr: string,
        resolve: (value: Node | PromiseLike<Node | null> | null) => void
    ) {
        if (error) {
            console.log(`error: ${error.message}`);
            resolve(null);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            resolve(null);
            return;
        }
        var out = stdout;
        parser.parseString(out, function (err: any, result: any) {
            if (
                !result.nmaprun.host[0].status[0].$.state &&
                !result.nmaprun.host[0].status[0].$.state.includes("up")
            ) {
                var returnVal: Node = {
                    ip: result.nmaprun.host[0].address[0].$.addr,
                    openPorts: [],
                    up: false,
                };
                resolve(returnVal);
                return;
            }
            var openPorts = result.nmaprun.host[0].ports[0].port;
            var outOpenPorts = Array();
            if (openPorts) {
                for (var port in openPorts) {
                    if (
                        openPorts[port].state[0].$.state &&
                        openPorts[port].state[0].$.state === "open"
                    ) {
                        //console.log({ protocol: buff[port].service[0].$.name, portid: buff[port].$.portid })
                        outOpenPorts.push({
                            protocol: openPorts[port].service[0].$.name,
                            portid: openPorts[port].$.portid,
                        });
                    }
                }
                let returnVal: Node = {
                    ip: result.nmaprun.host[0].address[0].$.addr,
                    openPorts: outOpenPorts,
                    up: true,
                };
                resolve(returnVal);
                return;
            }
            resolve(null);
            return;
        });
    }

    /**
     * runs the default NMAP scan (1000 most used tcp ports) with T level {@link T_LEVEL_SHORT}
     * @param IP the ip for which the scan is ran
     * @returns Promise that resolves to either null or a Node object (ip, open ports, is it up)
     */
    defScanOfIp(IP: string) {
        return new Promise<Node | null>((resolve) => {
            var arg_ip_version = "-4";
            if (IP.includes(":")) {
                arg_ip_version = "-6";
            }
            exec.exec(
                "nmap " +
                    IP +
                    " -Pn -T" +
                    T_LEVEL_SHORT +
                    " " +
                    arg_ip_version +
                    " -oX - --host-timeout " +
                    TIMEOUT_SHORT_SCAN,
                { maxBuffer: Infinity },
                (error, stdout, stderr) => {
                    this.interpretNmapReturn(error, stdout, stderr, resolve);
                }
            );
        });
    }

    /**
     * checks whether specific ports of a given IP are open with T level {@link T_LEVEL_SHORT}
     * @param IP the ip for which the scan is ran
     * @param portList list of ports to check whether they are open
     * @returns Promise that resolves to either null or a Node object (ip, open ports, is it up)
     */
    checkSpecificports(IP: string, portList?: string | null) {
        return new Promise<Node | null>((resolve) => {
            if (portList === null || portList === "") {
                resolve(null);
                return;
            }
            var arg_ip_version = "-4";
            if (IP.includes(":")) {
                arg_ip_version = "-6";
            }
            exec.exec(
                "nmap " +
                    IP +
                    " -Pn -T" +
                    T_LEVEL_SHORT +
                    " " +
                    arg_ip_version +
                    " -oX - --host-timeout " +
                    TIMEOUT_SHORT_SCAN +
                    " -p " +
                    portList,
                { maxBuffer: Infinity },
                (error, stdout, stderr) => {
                    this.interpretNmapReturn(error, stdout, stderr, resolve);
                }
            );
        });
    }

    /**
     * Interpets the XML output from NMAP bulk scan (more than 1 IP)
     * @param error parameter used in case of an error
     * @param stdout standard out (for successful output) will be in XML
     * @param stderr standard error stream
     * @param resolve function used to resolve the promise
     * @returns void, however will resolve to either null or array of Node object (ip, open ports, is it up)
     */
    interpretNmapReturnBulk(
        error: exec.ExecException | null,
        stdout: string,
        stderr: string,
        resolve: (value: Node[] | PromiseLike<Node[] | null> | null) => void
    ) {
        if (error) {
            console.log(`error: ${error.message}`);
            resolve(null);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            resolve(null);
            return;
        }
        var out = stdout;
        parser.parseString(out, function (err: any, result: any) {
            var returnVal: Node[] = [];
            for (var host in result.nmaprun.host) {
                var currentHost = result.nmaprun.host[host];
                if (
                    !currentHost.status[0].$.state &&
                    !currentHost.status[0].$.state.includes("up")
                ) {
                    returnVal.push({
                        ip: currentHost.address[0].$.addr,
                        openPorts: [],
                        up: false,
                    });
                    continue;
                }
                var curHostPorts = currentHost.ports[0].port;
                var outOpenPorts = Array();
                if (curHostPorts) {
                    for (var port in curHostPorts) {
                        if (
                          curHostPorts[port].state[0].$.state &&
                          curHostPorts[port].state[0].$.state === "open"
                        ) {
                          outOpenPorts.push({
                                protocol: curHostPorts[port].service[0].$.name,
                                portid: curHostPorts[port].$.portid,
                            });
                        }
                    }
                    returnVal.push({
                        ip: currentHost.address[0].$.addr,
                        openPorts: outOpenPorts,
                        up: true,
                    });
                }
            }
            resolve(returnVal);
            return;
        });
    }

    /**
     * Checks a {@link MAX_LONG_SCANS} number of ips, starting from port 0 to port 65535 with T level {@link T_LEVEL_LONG}
     * @param IPList list of Ips, separated by space
     * @param IPv4 specifies whether the list is in IPv4 or IPv6 format (mix of both will fail)
     * @returns Promise object which will resolve to an array of nodes or null
     */
    checkBulk(IPList: string, isIPv4: boolean) {
        var arg_ip_version = " -4";
        if (!isIPv4) arg_ip_version = " -6";
        console.log(" checking bulk  " + IPList);
        return new Promise<Node[] | null>((resolve) => {
            exec.exec(
                "nmap " +
                    IPList +
                    arg_ip_version +
                    " -Pn -T" +
                    T_LEVEL_LONG +
                    " -oX - -p 0-65535 --host-timeout " +
                    TIMEOUT_LONG_SCAN,
                { maxBuffer: Infinity },
                (error, stdout, stderr) => {
                    this.interpretNmapReturnBulk(
                        error,
                        stdout,
                        stderr,
                        resolve
                    );
                }
            );
        });
    }

    start() {
        // dbCon.getNodesNonNullPort((result)=>{
        //   this.shortScan(result).then(()=>this.scheduleAShortScan())
        // });
        dbCon.getNodesNonNullPort((result) => {
            this.shortScanList = result;
            this.shortScanver2(0);
        });
        dbCon.getNullPortNodes((result) => {
            this.longScan(result).then(() => this.scheduleALongScan());
        });
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
