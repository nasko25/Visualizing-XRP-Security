import * as exec from "child_process";
import * as xml2js from "xml2js";

var parser = new xml2js.Parser();


//This class serves as an Interface with NMAP
//Provides also an interpreter of the result to JSON (Since nmap returns in XML)

interface ProtocolPortid {
    protocol: string;
    portid: string;
}

interface Node {
    ip: string;
    openPorts: ProtocolPortid[];
    up: boolean;
}


class NmapInterface{
    constructor(){

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
            //Make sure this ip has something worth checking and that it is not missing fields (i.e. undefined)
            if (
                !result.nmaprun.host ||
                !result.nmaprun.host[0].status ||
                !result.nmaprun.host[0].status[0].$.state ||
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
                        openPorts[port].state &&
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
    topPortsScan(IP: string, timeout: string, T_LEVEL: number, topPorts: number) {
        return new Promise<Node | null>((resolve) => {
            var arg_ip_version = "-4";
            if (IP.includes(":")) {
                arg_ip_version = "-6";
            }
            exec.exec(
                "nmap " + IP + " -Pn -T" + T_LEVEL +
                    " " + arg_ip_version + " -oX - --host-timeout " + timeout +
                    " --top-ports "+topPorts,
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
    checkSpecificports(IP: string, T_LEVEL: number, timeout: string, portList: string | null) {
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
                    T_LEVEL +
                    " " +
                    arg_ip_version +
                    " -oX - --host-timeout " +
                    timeout +
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
        
        //interpet output (done async)
        parser.parseString(out, function (err: any, result: any) {
            var returnVal: Node[] = [];
        
            for (var host in result.nmaprun.host) {
                var currentHost = result.nmaprun.host[host];
                if (
                    !currentHost.status ||
                    !currentHost.status[0].$.state ||
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
                          curHostPorts[port].state &&
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
    checkBulk(IPList: string, isIPv4: boolean, T_LEVEL: number, timeout: string) {
        var arg_ip_version = " -4";
        if (!isIPv4) arg_ip_version = " -6";
        
        return new Promise<Node[] | null>((resolve) => {
            exec.exec(
                "nmap " +
                    IPList +
                    arg_ip_version +
                    " -Pn -T" +
                    T_LEVEL +
                    " -oX - -p 0-65535 --host-timeout " +
                    timeout,
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
}

export default NmapInterface;
