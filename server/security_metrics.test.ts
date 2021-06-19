import SecurityMetric from "./security_metrics";
import * as formulas from './formulas'
import axios from "axios";
import EventEmitter from "events";

jest.mock("axios");
const axiosMock = axios as jest.Mocked<typeof axios>;

function evaluateFunction1(x: number, a?: number, b?: number, c?: number, cutoff?: number, decimals?: number ){
    if(a==undefined) a=5;
    return(x*2+a);

}

function evaluateFunction2(x: number, a?: number, b?: number, c?: number, cutoff?: number, decimals?: number ){
    if(a==undefined) a=5;
    if(b==undefined) b=3;
    return(x*b+a);

}


afterEach(() => {
    jest.clearAllMocks();
});

test("test rateVersionBasedOnRelease", () => {
    // test if we rateVersionBasedOnRelease correctly
    const secMetrcic = new SecurityMetric();
    expect(secMetrcic.rateVersionBasedOnRelease(5,evaluateFunction1)).toBe(11.1);
    expect(secMetrcic.rateVersionBasedOnRelease(4,evaluateFunction1)).toBe(9.1);
    expect(secMetrcic.rateVersionBasedOnRelease(-1,evaluateFunction1)).toBe(-1000);
    expect(formulas.round_to_decimals(secMetrcic.rateVersionBasedOnRelease(4,evaluateFunction2),1)).toBe(5.3);
    secMetrcic.setCutoff(-1000000);
    expect(secMetrcic.rateVersionBasedOnRelease(-1,evaluateFunction1)).toBe(-1000000);
});


test("test rateVersionBasedOnIndex", () => {
    // test if we rateVersionBasedOnIndex correctly
    const secMetrcic = new SecurityMetric();
    expect(secMetrcic.rateVersionBasedOnIndex(5,evaluateFunction1)).toBe(10.6);
    expect(secMetrcic.rateVersionBasedOnIndex(4,evaluateFunction1)).toBe(8.6);
    expect(formulas.round_to_decimals(secMetrcic.rateVersionBasedOnIndex(5,evaluateFunction2),1)).toBe(6.1);
});


test("test rateBasedOnOpenPorts", () => {
    // test if we rateBasedOnOpenPorts correctly
    const secMetrcic = new SecurityMetric();
    expect(formulas.round_to_decimals(secMetrcic.rateBasedOnOpenPorts(5),1)).toBe(12);
    secMetrcic.setPortsGraceNumber(4);
    expect(formulas.round_to_decimals(secMetrcic.rateBasedOnOpenPorts(5),1)).toBe(79.5);
    secMetrcic.setPortsGraceNumber(3);
    expect(formulas.round_to_decimals(secMetrcic.rateBasedOnOpenPorts(1000),1)).toBe(-1000);
    secMetrcic.setCutoff(-1000000);
    expect(formulas.round_to_decimals(secMetrcic.rateBasedOnOpenPorts(1000),1)).toBe(-516844.5);
});


test("test getRating", () => {
    // test if we getRating correctly
    const secMetrcic = new SecurityMetric();
    secMetrcic.setVerboseLevel(10);
    const mp = new Map()
    mp.set("4",{    index: 5,
        tagName: "4",
        publishDate: new Date(),
        scoreRelease : 11.1,
        scoreIndex: 13})
    secMetrcic.setVersionMap(mp)
    expect(secMetrcic.getRating("rippled-4")).toStrictEqual([13, 11.1]);
    expect(secMetrcic.getRating("4")).toStrictEqual([13,11.1]);
    expect(secMetrcic.getRating("2552")[0]).toBe(-1000);
    expect(secMetrcic.getRating("2552")[1]).toBe(-1000);
    secMetrcic.setCutoff(-1000000);
    expect(secMetrcic.getRating("2552")[0]).toBe(-1000000);
    expect(secMetrcic.getRating("2552")[1]).toBe(-1000000);
});

test("test check for update fail", async () => {
    const secMetrcic = new SecurityMetric();
    secMetrcic.setVerboseLevel(10);
    axiosMock.get.mockRejectedValueOnce(new Error("Server not responding"));

    console.log = jest.fn();
    await secMetrcic.checkForUpdate(new EventEmitter);
    expect(console.log).toBeCalledTimes(0);
    expect(Array.from(secMetrcic.listOfVersions.keys()).length).toBe(0)
});

test("test check for update succeed", async () => {
    const secMetrcic = new SecurityMetric();
    secMetrcic.setVerboseLevel(10);
    const response = {
        data: [{
            tag_name: "1.7",
            published_at: new Date()
        }
        ],
        status: 200
    };

    axiosMock.get.mockResolvedValueOnce(response);

    var pseudoFunc = jest.fn();
    var envt = new EventEmitter()
    envt.on('done', pseudoFunc);
    console.log = jest.fn();
    await secMetrcic.checkForUpdate(envt);
    expect(console.log).toBeCalledTimes(2);
    expect(pseudoFunc).toBeCalledTimes(1);
    expect(Array.from(secMetrcic.listOfVersions.keys()).length).toBe(1)
});

test("test check for update succeed 2 versions", async () => {
    const secMetrcic = new SecurityMetric();
    secMetrcic.setVerboseLevel(10);
    const response = {
        data: [{
            tag_name: "1.7",
            published_at: new Date()
        },
        {
            tag_name: "1.6",
            published_at: new Date()
        }
        ],
        status: 200
    };

    axiosMock.get.mockResolvedValueOnce(response);

    var pseudoFunc = jest.fn();
    var envt = new EventEmitter()
    envt.on('done', pseudoFunc);
    console.log = jest.fn();
    await secMetrcic.checkForUpdate(envt);
    expect(console.log).toBeCalledTimes(2);
    expect(pseudoFunc).toBeCalledTimes(1);
    expect(Array.from(secMetrcic.listOfVersions.keys()).length).toBe(2);
    expect(secMetrcic.getRating("1.7")).toStrictEqual([100,100])
    expect(secMetrcic.getRating("1.6")).toStrictEqual([94,100])
});