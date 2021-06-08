import EventEmitter from "events";
import {
    getAllNodes,
    insertSecurityAssessments,
} from "./db_connection/db_helper";
import { Node } from "./db_connection/models/node";
import { SecurityAssessment } from "./db_connection/models/security_assessment";
import Logger from "./logger";

// A class representing the component that handles the data flow for the security assessment of Stock Nodes
class Security_Scanner {
    scan_interval: number = 10;

    /* 
    Constructor

    scan_interval - the interval during which to perform the scanning
    */
    constructor(scan_interval: number) {
        this.scan_interval = scan_interval;
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
                            Logger.info("Scheduling 50")
                            this.schedule(once);
                        });
                });
            })
            .catch((err) => {
                Logger.error(`SS: Fetching of nodes failed: ${err.message}!`);
            })
            .finally(() => {
                Logger.info("Scheduling 58")
                this.schedule(once);
            });
    }

    schedule(once?: boolean) {
        if (!once) {
            Logger.error(
                `SS: Scheduling next assessment after ${this.scan_interval} hours.`
            );
            setTimeout(this.run, 3600 * 1000 * this.scan_interval);
        }
    }

    computeScoreForAllNodes(nodes: Node[]): Promise<SecurityAssessment[]> {
        let computation_promises = nodes.map((node) =>
            this.computeScoreForNode(node)
        );

        return Promise.all(computation_promises);
    }

    computeScoreForNode(node: Node): SecurityAssessment {
        return {
            public_key: "",
            metric_version: 0.0,
            score: 0.0,
        };
    }
}
