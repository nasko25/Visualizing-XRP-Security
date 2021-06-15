import { Mutex } from "async-mutex";
import EventEmitter from "events";
import {
    getAllNodes,
    insertSecurityAssessments,
} from "./db_connection/db_helper";
import { Node } from "./db_connection/models/node";
import { SecurityAssessment } from "./db_connection/models/security_assessment";
import Logger from "./logger";
import SecurityMetric from "./security_metrics";

// A class representing the component that handles the data flow for the security assessment of Stock Nodes
class Security_Scanner {
    // A mutex used when the calculation is being done
    mutex = new Mutex();
    scan_interval: number = 10;
    security_calculator: SecurityMetric = new SecurityMetric();
    update_finished: boolean = false;

    /* 
    Constructor

    scan_interval - the interval during which to perform the scanning
    */
    constructor(scan_interval: number, security_calculator?: SecurityMetric) {
        this.scan_interval = scan_interval;

        if (security_calculator) this.security_calculator = security_calculator;
    }

    /*
    The starting point for security scanning.
    
    once - if true, indicates that the scanning should be done only once
    */
    run(once?: boolean) {
        // Gets all nodes
        Logger.info("SS: Fetching nodes from database ...");
        getAllNodes()
            .then((nodes: Node[]) => {
                Logger.info("SS: Nodes successfully fetched.");

                // Makes the assessments
                Logger.info("SS: Beginning security assessment ...");
                this.computeScoreForAllNodes(nodes).then((assessments) => {
                    Logger.info("SS: Finished security assessment ...");

                    // Insert into database
                    Logger.info("SS: Storing ...");
                    insertSecurityAssessments(assessments)
                        .then(() => {
                            Logger.info("SS: Storing was successful!");
                        })
                        .catch((err) => {
                            Logger.error(`SS: Storing failed: ${err.message}`);
                        })
                        .finally(() => {

                        });
                });
            })
            .catch((err) => {
                Logger.error(`SS: Fetching of nodes failed: ${err.message}!`);
            })
            .finally(() => {
                Logger.info("Scheduling 50");
                (<any>process).send(this.security_calculator.latestVersion);
                //this.schedule(once);
            });
    }
    start(once?: boolean) {
        if (this.mutex.isLocked()) return;
        this.mutex.acquire().then(async (release) => {
            if (this.update_finished) {
                this.run(once);
                release();
            } else {
                console.log("WE NEED TO START SEC CAL FIRST!")
                const finish = new EventEmitter();
                finish.on('done', () => {
                    if (!this.update_finished) {
                        finish.removeAllListeners();
                        this.update_finished = true;
                        this.run(once);
                    }
                    release();
                });
                this.security_calculator.start(finish);
            }
        });
    }
    schedule(once?: boolean) {
        if (!once) {
            Logger.info(
                `SS: Scheduling next assessment after ${this.scan_interval} minutes.`
            );
            setTimeout(this.run, 60 * 1000 * this.scan_interval);
        }
    }

    computeScoreForAllNodes(nodes: Node[]): Promise<SecurityAssessment[]> {
        let computation_promises = nodes.map((node) =>
            this.computeScoreForNode(node)
        );

        return Promise.all(computation_promises);
    }
    flag: number = 0;
    computeScoreForNode(node: Node): SecurityAssessment {
        var buff = this.security_calculator.getRating(node.rippled_version)[1];
        if (this.flag < 4) {
            Logger.info("NODE " + node.IP + " SCORED " + buff + " ver " + node.rippled_version)
            this.flag++;
        }
        return {
            public_key: node.public_key,
            metric_version: buff,
            score: Math.max(0, node.ports ? 0.6 * buff + 0.4 * this.security_calculator.rateBasedOnOpenPorts(node.ports.split(',').length) : 0.8 * buff),
            timestamp: new Date()
        };
    }

}
export default Security_Scanner;