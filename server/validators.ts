import axios, { AxiosResponse } from "axios";
import Logger from "./logger";
import { decode } from "js-base64";
import {
    getIpAddresses,
    insertNodeValidatorConnections,
    insertValidators,
} from "./db_connection/db_helper";
import { NodeIpKeyPublisher } from "./db_connection/models/node";
import https from "https";

/** @interface
 *
 * JSON format of result returned from /vl/{publisher-key}
 *
 * */
interface Validator_List_Result {
    manifest: string;
    blob: string;
    public_key: string;
    signature: string;
    version: number;
}

/** @interface
 *
 * JSON format of decoded blob field of @interface Validator_List_Result
 *
 * */
interface Validator_Data {
    sequence: number;
    expiration: number;
    validators: Validator[];
}

interface Validator {
    validation_public_key: string;
    manifest: string;
}

const agent = new https.Agent({
    rejectUnauthorized: false,
});

export default class ValidatorIdentifier {
    validators: Map<string, null> = new Map();
    node_validators: Map<string, string[]> = new Map();
    validatorBatchCount: number = 4;

    run() {
        getIpAddresses()
            .then((nodes: NodeIpKeyPublisher[]) => {
                Logger.info("VI: Database queried ...");

                // Start the process with the DB fetched data
                this.identify_validators_for_batch(nodes);
            })
            .catch((err) =>
                Logger.error(
                    `VI: Could not start identification of validators : ${err.message}!`
                )
            );
    }

    identify_validators_for_batch(nodes: NodeIpKeyPublisher[]) {
        if (nodes.length === 0) {
            Logger.info("VI: Finished idetifying validators.");
            return;
        }

        let splice = nodes.splice(0, this.validatorBatchCount);

        Logger.info(
            "VI: Checking batch from a total of " + nodes.length + " nodes ..."
        );

        axios
            .all(
                // Create an array of Promise objects for all requests
                splice.map((node) =>
                    this.promiseWrapper(
                        node.IP,
                        node.publisher,
                        node.public_key
                    )
                )
            )
            .then(
                // Response is an array of tuples (node_key, val_keys)
                axios.spread((...res) => {
                    // Add the validator keys to the main Validators Map
                    // Add the validator keys to the Node -> Validators Map
                    Logger.info("VI: Adding validator keys to maps ...");

                    res.forEach((tuple) => {
                        let key: string = tuple[0];
                        let vals: string[] = tuple[1];

                        if (vals.length > 1)
                            this.node_validators.set(key, vals);

                        vals.forEach((valKey) => {
                            this.validators.set(valKey, null);
                        });
                    });

                    Logger.info(
                        "VI: Adding of validator keys to maps completed!"
                    );

                    // Put in database
                    insertValidators(this.validators)
                        .then(() => {
                            Logger.info(
                                "VI: Validators inserted successfully!"
                            );
                            insertNodeValidatorConnections(this.node_validators)
                                .then(() => {
                                    Logger.info(
                                        "VI: Node - Validators connections inserted successfully!"
                                    );
                                })
                                .catch((mes: Error) => {
                                    Logger.error(
                                        "VI: Could not insert node-validator connections into database: " +
                                            mes.message
                                    );
                                })
                                .finally(() => {
                                    this.validators.clear();
                                    this.node_validators.clear();
                                    this.identify_validators_for_batch(nodes);
                                });
                        })
                        .catch((err: Error) => {
                            Logger.error(
                                "VI: Could not insert validators into database: " +
                                    err.message
                            );
                            this.validators.clear();
                            this.node_validators.clear();
                            this.identify_validators_for_batch(nodes);
                        });
                })
            )
            .catch((error: Error) => {
                Logger.error("VI: Batch checking failed: " + error.message);
                this.identify_validators_for_batch(nodes);
            });
    }

    // A method thаt makes the request
    get_validator_list(ip: string, publisher_key: string) {
        Logger.info(ip);
        return axios.get<any, AxiosResponse<Validator_List_Result>>(
            `https://[${ip}]:51235/vl/${publisher_key}`,
            { httpsAgent: agent, timeout: 3000 }
        );
    }

    // A method that calls get_validator_list and makes sure a Promise is returned that does not reject
    // This is to avoid batch processing to fail because only one of the requests failed.
    promiseWrapper(
        ip: string,
        publisher: string,
        public_key: string
    ): Promise<[string, string[]]> {
        return new Promise((resolve) =>
            this.get_validator_list(ip, publisher)
                .then((res) =>
                    resolve([public_key, this.extractValidatorKeys(res.data)])
                )
                .catch(() => resolve([public_key, []]))
        );
    }

    // A method to extract the validator keys from a response JSON object
    extractValidatorKeys(valData: Validator_List_Result) {
        // decode base64 encoded blob data
        let decoded: Validator_Data = JSON.parse(decode(valData.blob));

        // Extract the list of validator keys
        return decoded.validators.map((val) => val.validation_public_key);
    }
}
