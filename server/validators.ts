import axios, { AxiosResponse } from "axios";
import Logger from "./logger";
import { decode, encode } from "js-base64";
import { getIpAddresses, insertNodeValidatorConnections, insertValidators } from "./db_connection/db_helper";
import { NodeIpKeyPublisher } from "./db_connection/models/node";
import https from "https";
import { encodeNodePublic } from "ripple-address-codec";

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
    currentCount: number = 0;

    get_validator_list(ip: string, publisher_key: string) {
        return axios.get<any, AxiosResponse<Validator_List_Result>>(
            `https://[${ip}]:51235/vl/${publisher_key}`,
            { httpsAgent: agent, timeout: 3000 }
        );
    }

    run() {

        getIpAddresses().then((nodes : NodeIpKeyPublisher[]) => {

                Logger.info("Database queried ...");

                // Start the process with the DB fetched data
                this.identify_validators_for_batch(nodes);

        }).catch(err => Logger.error(`Could not stat identification of validators : ${err.message}!`));
        
    }

    identify_validators_for_batch(nodes: NodeIpKeyPublisher[]) {
        Logger.info(
            "Checking batch from the remaining " + nodes.length + " nodes."
        );

        if (nodes.length == 0) {
            Logger.info("Finished idetifying validators. Inserting into database ...");
        }

        let node: NodeIpKeyPublisher = nodes[0];
        nodes.pop();

        Promise.all([
                this.get_validator_list(node.IP, node.publisher)]
        )
            .then(
                axios.spread((...responses) => {
                    responses.forEach((res) => {

                        // Add the validator keys to the main Validators Map
                        // Add the validator keys to the Node -> Validators Map
                        let valKeys = this.extractValidatorKeys(res.data);
                        this.node_validators.set(nodes[0].public_key, valKeys);
                        valKeys.forEach(valKey => {
                            this.validators.set(valKey, null);
                        });                        

                        // Put in database if batch count reached
                        this.currentCount++;
                        if (this.currentCount === this.validatorBatchCount) {
                                insertValidators(this.validators).then(() => {
                                    Logger.info("Validators inserted successfully!");
                                    insertNodeValidatorConnections(this.node_validators).then(() => {
                                        Logger.info("Node - Validators connections inserted successfully!");
                                        this.validators.clear();
                                        this.node_validators.clear();
                                    });
                                });
                            this.currentCount = 0;
                        }
                    });

                    this.identify_validators_for_batch(nodes);
                })
            )
            .catch((error) => {
                Logger.error(error.message);
                this.identify_validators_for_batch(nodes);
            });
    }

    // A method to extract the validator keys from a response JSON object
    extractValidatorKeys(valData: Validator_List_Result) {
        // decode base64 encoded blob data
        let decoded: Validator_Data = JSON.parse(decode(valData.blob));

        // Extract the list of validator keys
        return decoded.validators.map((val) =>
            encodeNodePublic(Buffer.from(val.validation_public_key))
        );
    }
}

let valIden = new ValidatorIdentifier();
valIden.run();
