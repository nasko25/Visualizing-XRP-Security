import ValidatorIdentifier, { Validator_List_Result, Validator, Validator_Data } from './validators'
import axios, {AxiosResponse} from 'axios';
import { encode } from 'js-base64';
import { getIpAddresses, insertNodeValidatorConnections, insertValidators } from './db_connection/db_helper';


// prepare axios for mocking
jest.mock("axios");
const axiosMock = axios as jest.Mocked<typeof axios>;

import Logger from './logger';
import { decodeNodePublic } from 'ripple-address-codec';
jest.mock("./logger")

jest.mock('./db_connection/db_helper');
const getIpAddressesMock = getIpAddresses as jest.MockedFunction<typeof getIpAddresses>
const insertValidatorsMock = insertValidators as jest.MockedFunction<typeof insertValidators>
const insertNodeValidatorConnectionsMock = insertNodeValidatorConnections as jest.MockedFunction<typeof insertNodeValidatorConnections>

afterEach(() => {
    jest.clearAllMocks();
});

function prepareValidatorResponse(pubKeys: string[]) : Validator_List_Result {

    let validators: { validation_public_key: string }[] = pubKeys.map(key => <{ validation_public_key: string }><unknown>{validation_public_key: decodeNodePublic(key).toString("hex")});
    let valData: Validator_Data = {
        validators: validators,
        expiration: 0,
        sequence: 1
    }

    let valListData: Validator_List_Result = {
        manifest: "manifest",
        version: 2,
        validation_public_key: "ddd",
        signature: "signature",
        blob: encode(JSON.stringify(valData))
    };

    return valListData;
}

test("test validator identifier: empty constructor", () => {

    let valIden : ValidatorIdentifier = new ValidatorIdentifier();

    expect(valIden).toBeTruthy();
    expect(valIden.validatorBatchCount).toEqual(10);

})

test("test validator identifier: constructor with number", () => {

    let number = 100;

    let valIden : ValidatorIdentifier = new ValidatorIdentifier(number);

    expect(valIden.validatorBatchCount).toEqual(number);


})

test("test: extractValidatorKeys() returns correctly decoded data non-empty list", () => {

    let pubKeys = ["nHB1vJRfvuEnzGeXffkfWMa6k3FqgTGxJefrsFiRu8WhgWNWoG4f", "nHB1vJRfvuEnzGeXffkfWMa6k3FqgTGxJefrsFiRu8WhgWNWoG4f", "nHB1vJRfvuEnzGeXffkfWMa6k3FqgTGxJefrsFiRu8WhgWNWoG4f"];
    let valListData = prepareValidatorResponse(pubKeys);

    let valIden = new ValidatorIdentifier();

    expect(valIden.extractValidatorKeys(valListData)).toEqual(pubKeys);

})


test("test: extractValidatorKeys() returns correctly decoded data empty kist", () => {

    let pubKeys = <string[]>[];
    let valListData = prepareValidatorResponse(pubKeys);

    let valIden = new ValidatorIdentifier();

    expect(valIden.extractValidatorKeys(valListData)).toEqual(pubKeys);

})


test("test: get_node_validator_list() successfully returns axios response", async () => {

    // the public keys
    let pubKeys = ["nHB1vJRfvuEnzGeXffkfWMa6k3FqgTGxJefrsFiRu8WhgWNWoG4f", "nHB1vJRfvuEnzGeXffkfWMa6k3FqgTGxJefrsFiRu8WhgWNWoG4f", "nHB1vJRfvuEnzGeXffkfWMa6k3FqgTGxJefrsFiRu8WhgWNWoG4f"];
    let valListData = prepareValidatorResponse(pubKeys);

    let valIden = new ValidatorIdentifier();

    axiosMock.get.mockResolvedValueOnce({data: valListData});

    let public_key: string = "test_key";

    let res = await valIden.get_node_validator_list("ip", "publisher", public_key)
        expect(res[0]).toEqual(public_key)
        expect(res[1]).toEqual(pubKeys)

})

test("test: get_node_validator_list() returns empty array after error", async () => {

    let valIden = new ValidatorIdentifier();

    axiosMock.get.mockRejectedValueOnce(new Error());

    let public_key: string = "test_key";

    valIden.get_node_validator_list("ip", "publisher", public_key).then((res) => {
        expect(res[0]).toEqual(public_key)
        expect(res[1]).toEqual([])
    })

})

test("test: run successfully handles database error", async () => {

    getIpAddressesMock.mockRejectedValue(new Error);

    let valIden: ValidatorIdentifier = new ValidatorIdentifier();

    await valIden.run()

        expect(Logger.info).not.toHaveBeenCalled();
        expect(Logger.error).toHaveBeenCalledTimes(1);


});
