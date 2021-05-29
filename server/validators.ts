import axios, { AxiosResponse } from "axios";
import Logger from "./logger";
import {decode} from 'js-base64'
import { getIpAddresses } from "./db_connection/db_helper";
import { NodeIpKeyPublisher } from "./db_connection/models/node";
import https from 'https'

interface Validator_List_Result {
    manifest: string,
    blob: string,
    public_key: string,
    signature: string,
    version: number
}

interface Validator_Data {
    sequence: number,
    expiration: number,
    validators: Validator[]
}

interface Validator {
    validation_public_key: string,
    manifest: string,
}

const agent = new https.Agent({
    rejectUnauthorized: false,
});

export default class ValidatorIdentifier {

    get_validator_list(ip: string, publisher_key: string) {
        return axios.get<any, AxiosResponse<Validator_List_Result>>(`https://[${ip}]:51235/vl/${publisher_key}`, { httpsAgent : agent , timeout: 3000});
    }

    run() {

        getIpAddresses().then((nodes : NodeIpKeyPublisher[]) => {

                Logger.info("Database queried ...");

                // Start the process with the DB fetched data
                this.identify_validators_for_batch(nodes);

        }).catch(err => Logger.error(`Could not stat identification of validators : ${err.message}!`));

    }

    identify_validators_for_batch(nodes: NodeIpKeyPublisher[]) {

        Logger.info("Entered the function");

        if (nodes.length == 0) {
            console.log("Finished");
            return;
        }
        
        let batch = nodes.splice(0, 1);

        Promise.all(batch.map(node => this.get_validator_list(node.IP, node.publisher))).then(axios.spread((...responses) => {
            
            responses.forEach(res => {
                let decoded : Validator_Data = JSON.parse(decode(res.data.blob));
                decoded.validators.forEach(val => console.log(val.validation_public_key));
                
                // TODO place in database
            });
            
            this.identify_validators_for_batch(nodes);

        })).catch((error) => {
            Logger.error(error.message);

            this.identify_validators_for_batch(nodes)

            
        });

    }
}


let valIden = new ValidatorIdentifier();
valIden.run();