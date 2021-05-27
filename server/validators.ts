import axios, { AxiosResponse } from "axios";
import Logger from "./logger";
import {decode} from 'js-base64'

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

function get_validator_list(ip: string, publisher_key: string) {

    const url = `https://${ip}:51235/vl/${publisher_key}`;

    axios.get(url).then((result: AxiosResponse<Validator_List_Result>) => {
    
        let decodedBlob_validators : Validator_Data = JSON.parse(decode(result.data.blob));
        
        console.log(decodedBlob_validators.validators.map((val) => val.validation_public_key));

    }).catch((err : Error) => {
        Logger.info(err.message);
    });


}

get_validator_list("s1.ripple.com", "ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734");