import ValidatorIdentifier, { Validator_List_Result, Validator, Validator_Data } from './validators'
import axios, {AxiosResponse} from 'axios';
import { encode } from 'js-base64';


// prepare axios for mocking
jest.mock("axios");
const axiosMock = axios as jest.Mocked<typeof axios>;

afterEach(() => {
    jest.clearAllMocks();
});

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

    // the public keys
    let pubKeys = ["pubkey1", "pubkey2", "pubkey3"];

    let validators: Validator[] = pubKeys.map(key => <Validator>{manifest: "manifest", validation_public_key: key });
    let valData: Validator_Data = {
        validators: validators,
        expiration: 0,
        sequence: 1
    }

    let valListData: Validator_List_Result = {
        manifest: "manifest",
        version: 2,
        public_key: "ddd",
        signature: "signature",
        blob: encode(JSON.stringify(valData))
    };

    let valIden = new ValidatorIdentifier();

    expect(valIden.extractValidatorKeys(valListData)).toEqual(pubKeys);

})


test("test: extractValidatorKeys() returns correctly decoded data empty kist", () => {

    // the public keys
    let pubKeys = <string[]>[];

    let validators: Validator[] = pubKeys.map(key => <Validator>{manifest: "manifest", validation_public_key: key });
    let valData: Validator_Data = {
        validators: validators,
        expiration: 0,
        sequence: 1
    }

    let valListData: Validator_List_Result = {
        manifest: "manifest",
        version: 2,
        public_key: "ddd",
        signature: "signature",
        blob: encode(JSON.stringify(valData))
    };

    let valIden = new ValidatorIdentifier();

    expect(valIden.extractValidatorKeys(valListData)).toEqual(pubKeys);

})


test("test: promiseWrapper() successfully returns axios response", async () => {

    // the public keys
    let pubKeys = ["pubkey1", "pubkey2", "pubkey3"];

    let validators: Validator[] = pubKeys.map(key => <Validator>{manifest: "manifest", validation_public_key: key });
    let valData: Validator_Data = {
        validators: validators,
        expiration: 0,
        sequence: 1
    }

    let valListData: Validator_List_Result = {
        manifest: "manifest",
        version: 2,
        public_key: "ddd",
        signature: "signature",
        blob: encode(JSON.stringify(valData))
    };

    let valIden = new ValidatorIdentifier();

    axiosMock.get.mockResolvedValueOnce({data: valListData});

    let public_key: string = "test_key";

    valIden.promiseWrapper("ip", "publisher", public_key).then((res) => {
        expect(res[0]).toEqual(public_key)
        expect(res[1]).toEqual(pubKeys)
    })

})