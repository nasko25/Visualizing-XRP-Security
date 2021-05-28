import Crawler, { normalizePublicKey } from "./crawl";
import axios from 'axios';

// save console.error and console.log to restore them after mocking them in some tests
const console_error = console.error;
const console_log = console.log;
// prepare axios for mocking
jest.mock("axios");
const axiosMock = axios as jest.Mocked<typeof axios>

// mock the db helper
import { insertNode, insertConnection } from './db_connection/db_helper';
jest.mock('./db_connection/db_helper');

const DEFAULT_PEER_PORT = 51235;

test("test crawler constructor with empty array as parameter", () => {
    console.error = jest.fn();
    expect(() => new Crawler([])).toThrow("EmptyArrayException");
    expect(console.error).toHaveBeenCalledTimes(1);

    // restore the original console.error after mocking it
    console.error = console_error;
});

test("test crawler constructor with only invalid IPs", () => {
    console.log = jest.fn();
    expect(() => new Crawler(["ip", "ip:2", "invalid address"])).toThrow("RippleServersUrlWrongFormat");

    // the crawler should log the 3 invalid IP addresses
    expect(console.log).toHaveBeenCalledTimes(3);

    // restore the original console.log after mocking it
    console.log = console_log;
});

test("test crawler constructor with 3 invalid IPs and 1 valid IP", () => {
    console.log = jest.fn();
    const valid_ip = "1.2.3.4";
    const crawler = new Crawler(["ip", "ip:2", "255.265.1.2", valid_ip]);
    expect(crawler.rippleStartingServerIPs).toStrictEqual([valid_ip]);
    expect(crawler.rippleStartingServers).toStrictEqual([`https://[${valid_ip}]:${crawler.DEFAULT_PEER_PORT}/crawl`]);

    // the crawler should log the 3 invalid IP addresses
    expect(console.log).toHaveBeenCalledTimes(3);

    // restore the original console.log after mocking it
    console.log = console_log;
});

test("test crawler constructor with multiple valid IP addresses", () => {
    console.log = jest.fn();

    const valid_ips = ["1.2.3.4", "255.255.255.255", "::ffff:8.8.8.8", "2001:0000:3238:DFE1:0063:0000:0000:FEFB", "2001:0000:3238:DFE1:63:0000:0000:FEFB", "2001:0000:3238:DFE1:63::FEFB", "2001:0:3238:DFE1:63::FEFB"];
    let crawler = new Crawler(valid_ips);
    expect(crawler.rippleStartingServerIPs).toStrictEqual(valid_ips);
    expect(crawler.rippleStartingServers).toStrictEqual(valid_ips.map(ip => `https://[${ip}]:${crawler.DEFAULT_PEER_PORT}/crawl`));

    // crawler should not log anything because all IPs are valid
    expect(console.log).toHaveBeenCalledTimes(0);

    // restore the original console.log after mocking it
    console.log = console_log;
});

test("test normalizePublicKey function", () => {
    // test already normalized key
    expect(normalizePublicKey("n9MUnfGt2CSPGZNmzCxUvCucHSYvp9GHKaydfbZANKgEc14NXFHH")).toBe("n9MUnfGt2CSPGZNmzCxUvCucHSYvp9GHKaydfbZANKgEc14NXFHH");

    // test key that is too short
    expect(() => normalizePublicKey("nn")).toThrow();

    // test normalizePublicKey() with valid non-normalized keys
    expect(normalizePublicKey("A1MSLePc0/1jj/AdsdJe/Fu/0U1X9rXNzvMBCKziKgM4")).toBe("n9MfFzw4mgmo34htc61b6uaafXrU5g1yLw185qtWqmpGimhxHCGH");
    expect(normalizePublicKey("AgnV1yX5xJby8OUZgaHySNUJTmifn+a2IUUbQTpdVuXj")).toBe("n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFzE");
    expect(normalizePublicKey("A2Q+a2yWtSieQ5ioBgFinhimoWHI0PUz77lp35rPrtEM")).toBe("n9MEPeN8cn5ipaXRcwiHL7vAVzdGMLRsTpJJALJvdqx7g6ZeRPDt");
});

test("test crawl() with only unresponsive starting servers", async () => {
    // reject all axios.get() requests
    axiosMock.get.mockRejectedValue(new Error("Server not responding"));

    // mock console.log which will be called if no starting servers respond
    console.log = jest.fn();

    // initialize a new crawler with 3 test IPs that will be mocked
    const crawler = new Crawler(["1.2.3.4", "12.13.14.15", "1.2.33.3"]);
    const spy = jest.spyOn(crawler, "crawl");

    // wait for the Promises that axios returns
    await crawler.crawl();

    // crawler.crawl() should have been called 4 times (3 for each of the IP addresses
    // and 1 time with an empty list of IPs before throwing an exception)
    expect(spy).toHaveBeenCalledTimes(4);

    // console.log will only be called at the end when no starting servers respond with the "NoValidRippleServer" exception
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith("NoValidRippleServer");

    spy.mockRestore();
    console.log = console_log;
});

test("test crawl() with 1 responsive starting server that has no peers", async () => {
    // build the mocked axios responce for the starting server
    const response = {
        data: {
            server: {
                build_version: "1.7.0",
                pubkey_node: "n9KFUrM9FmjpnjfRbZkkYTnqHHvp2b4u1Gqts5EscbSQS2Fpgz16",
                uptime: 1234567
            }
        }
    };

    const peersResponse = {
        data: {
            overlay: {
                active: []
            }
        }
    };

    const startingServerIP = "1.2.3.4";

    // resolve the first axios request with the mocked response object
    // and the the second axios request that gets the starting server's peers
    axiosMock.get.mockResolvedValueOnce(response).mockResolvedValueOnce(peersResponse);

    await new Crawler([startingServerIP]).crawl();

    // assert that insertNode() was called with the expected Node object
    const insertedNode = {
        ip: startingServerIP,
        port: DEFAULT_PEER_PORT,
        version: "rippled-1.7.0",
        pubkey: "n9KFUrM9FmjpnjfRbZkkYTnqHHvp2b4u1Gqts5EscbSQS2Fpgz16",
        uptime: 1234567
    };
    expect(insertNode).toHaveBeenCalledTimes(1);
    expect(insertNode).toHaveBeenCalledWith(insertedNode);

    expect(insertConnection).toHaveBeenCalledTimes(0);
});
