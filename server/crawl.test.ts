import Crawler, { normalizePublicKey, Node } from "./crawl";
import axios from 'axios';

// save console.error and console.log to restore them after mocking them in some tests
const console_error = console.error;
const console_log = console.log;
// prepare axios for mocking
jest.mock("axios");
const axiosMock = axios as jest.Mocked<typeof axios>;

// mock the db helper
import { insertNode, insertConnection, updateVersionUptimeAndPublisher } from './db_connection/db_helper';
jest.mock('./db_connection/db_helper');
const insertNodeMock = insertNode as jest.MockedFunction<typeof insertNode>;
const insertConnectionMock = insertConnection as jest.MockedFunction<typeof insertConnection>;
const updateVersionUptimeAndPublisherMock = updateVersionUptimeAndPublisher as jest.MockedFunction<typeof updateVersionUptimeAndPublisher>;

// the logger should be mocked to test the promise rejection of insertNode() and insertConnection()
import Logger from './logger';
jest.mock('./logger');

const DEFAULT_PEER_PORT = 51235;

afterEach(() => {
      jest.clearAllMocks();
});

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
    await crawler.setVerboseLevel(10).crawl();

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
    console.log = jest.fn();

    // build the mocked axios responce for the starting server
    const response = {
        data: {
            server: {
                build_version: "1.7.0",
                pubkey_node: "n9KFUrM9FmjpnjfRbZkkYTnqHHvp2b4u1Gqts5EscbSQS2Fpgz16",
                uptime: 1234567
            },
            unl: {
                publisher_lists: [{
                   pubkey_publisher: "ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"
                }]
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

    insertNodeMock.mockResolvedValue();
    insertConnectionMock.mockResolvedValue();
    updateVersionUptimeAndPublisherMock.mockResolvedValue();

    await new Crawler([startingServerIP]).setVerboseLevel(10).crawl();

    // assert that insertNode() was called with the expected Node object
    const insertedNode = {
        ip: startingServerIP,
        port: DEFAULT_PEER_PORT,
        version: "rippled-1.7.0",
        pubkey: "n9KFUrM9FmjpnjfRbZkkYTnqHHvp2b4u1Gqts5EscbSQS2Fpgz16",
        uptime: 1234567,
        publishers: ["ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"],
        _visited: true
    };
    expect(insertNodeMock).toHaveBeenCalledTimes(1);
    expect(insertNodeMock).toHaveBeenCalledWith(insertedNode);

    expect(insertConnectionMock).toHaveBeenCalledTimes(0);

    // there are no visited peers that can be updated
    expect(updateVersionUptimeAndPublisherMock).toHaveBeenCalledTimes(0);

    expect(console.log).toHaveBeenCalledTimes(2);
    // only 1 node should have been visited, because it does not have any neighbors
    expect(console.log).toHaveBeenCalledWith("How many nodes we have visited: 1\nHow many UNIQUE IPs we have visited: 1");
    expect(console.log).toHaveBeenCalledWith("How many nodes we have saved: 1");

    console.log = console_log;
});

test("test crawl() with 1 starting server that has 1 peer with 1 peer (cyclic connection)", async () => {
    const startingServerIP = "1.2.3.4";
    const startingServerResponse = {
        data: {
            server: {
                build_version: "1.7.0",
                pubkey_node: "n9KFUrM9FmjpnjfRbZkkYTnqHHvp2b4u1Gqts5EscbSQS2Fpgz16",
                uptime: 1234567
            },
            unl: {
                publisher_lists: [{
                   pubkey_publisher: "ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"
                }]
            }
        }
    };

    const startingServerPeersResponse = {
        data: {
            overlay: {
                active: [{
                    ip: "1.1.1.1",
                    port: 51235,
                    version: "rippled-1.6.0",
                    public_key: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFzE",
                    uptime: 123456
                }]
            },
            unl: {
                publisher_lists: [{
                    pubkey_publisher: "ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"
                }]
            },
            server: {
                build_version: "1.7.0",
                pubkey_node: "n9KFUrM9FmjpnjfRbZkkYTnqHHvp2b4u1Gqts5EscbSQS2Fpgz16",
                uptime: 1234567
            }
        }
    };

    const firstPeerPeersResponse = {
        data: {
            overlay: {
                active: [{
                    ip: startingServerIP, // this is the first node's IP; the crawler should not loop infinitely
                    port: 51235,
                    version: "rippled-1.7.0",
                    public_key: "n9KFUrM9FmjpnjfRbZkkYTnqHHvp2b4u1Gqts5EscbSQS2Fpgz16",
                    uptime: 1234999
                }]
            },
            unl: {
                publisher_lists: [{
                    pubkey_publisher: "ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"
                }]
            },
            server: {
                build_version: "1.6.0",
                pubkey_node: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFzE",
                uptime: 123456
            }
        }
    };

    // resolve the first axios request with the mocked startingServerResponse object,
    // the second axios request gets the starting server's peers
    // the third axios request gets the peers of the starting server's peer
    axiosMock.get.mockResolvedValueOnce(startingServerResponse).mockResolvedValueOnce(startingServerPeersResponse).mockResolvedValueOnce(firstPeerPeersResponse);

    // spy on the Crawler's crawl() method to assert it was only called once
    // (hence no recursion occured because the initial node should have responded)
    const crawler = new Crawler([startingServerIP]);
    const spy = jest.spyOn(crawler, "crawl");

    // mock console.log to assert it prints extected results
    // (that only 2 nodes have been visited)
    console.log = jest.fn();

    insertNodeMock.mockResolvedValue();
    insertConnectionMock.mockResolvedValue();
    updateVersionUptimeAndPublisherMock.mockResolvedValue();

    // call the actual code from "crawl.ts"
    await crawler.setVerboseLevel(10).crawl();

    // crawler.crawl() should have been called only once
    expect(spy).toHaveBeenCalledTimes(1);
    // insertNode() should have been called twice - once for each unique node
    expect(insertNodeMock).toHaveBeenCalledTimes(2);

    const insertedNodes: Array<Node> = [
        // the initial node
        {
            ip: startingServerIP,
            port: DEFAULT_PEER_PORT,
            version: "rippled-1.7.0",
            pubkey: "n9KFUrM9FmjpnjfRbZkkYTnqHHvp2b4u1Gqts5EscbSQS2Fpgz16",
            uptime: 1234567,
            publishers: ["ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"],
            _visited: true
        },
        // the initial node's peer
        {
            ip: "1.1.1.1",
            port: 51235,
            version: "rippled-1.6.0",
            pubkey: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFzE",
            uptime: 123456,
            publishers: ["ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"],
            _visited: true
        }
    ];
    expect(insertNodeMock).toHaveBeenNthCalledWith(1, insertedNodes[0]);
    expect(insertNodeMock).toHaveBeenNthCalledWith(2, insertedNodes[1]);

    // the two nodes that are "visited" should have their version, uptime and publisher updated
    expect(updateVersionUptimeAndPublisherMock).toHaveBeenCalledTimes(2);
    expect(updateVersionUptimeAndPublisherMock).toHaveBeenNthCalledWith(1, insertedNodes[0]);
    expect(updateVersionUptimeAndPublisherMock).toHaveBeenNthCalledWith(2, insertedNodes[1]);

    // since the connection only needs the public keys, some of the information about the ndoes will be missing
    // so the objects need to be changed a little

    // the initial node's peer
    // when inserting a connection between it and the initial node,
    // this node will not have been visited yet
    insertedNodes[0]._visited =true;
    insertedNodes[1]._visited = false;
    insertedNodes[1].publishers = undefined;


    // there should be a connection between the initial node and its peer inserted in the database
    expect(insertConnectionMock).toHaveBeenCalledTimes(2);
    expect(insertConnectionMock).toHaveBeenCalledWith(insertedNodes[0], insertedNodes[1]);
    expect(insertConnectionMock).toHaveBeenCalledWith(insertedNodes[1], insertedNodes[0]);

    // the crawler should log that 2 nodes were visited and are saved in the database
    expect(console.log).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenNthCalledWith(1, "How many nodes we have visited: 2\nHow many UNIQUE IPs we have visited: 2");
    expect(console.log).toHaveBeenNthCalledWith(2, "How many nodes we have saved: 2");

    // restore the mocks
    spy.mockRestore();
    console.log = console_log;
});

test("test crawl() with 1 starting server and 1 peer with undefined IP and port", async () => {
    const startingServerIP = "1.2.3.4";
    const startingServerResponse = {
        data: {
            server: {
                build_version: "1.7.0",
                pubkey_node: "n9KFUrM9FmjpnjfRbZkkYTnqHHvp2b4u1Gqts5EscbSQS2Fpgz16",
                uptime: 1234567
            },
            unl: {
                publisher_lists: [{
                   pubkey_publisher: "ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"
                }]
            }
        }
    };

    const startingServerPeersResponse = {
        data: {
            overlay: {
                active: [{
                    ip: undefined,
                    port: undefined,
                    version: "rippled-1.6.0",
                    public_key: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFzE",
                    uptime: 123456
                }]
            },
            unl: {
                publisher_lists: [{
                   pubkey_publisher: "ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"
                }]
            },
            server: {
                build_version: "1.7.0",
                uptime: 1234567
            }
        }
    };

    // resolve the first axios request with the mocked startingServerResponse object,
    // and the second axios request gets the starting server's peer
    axiosMock.get.mockResolvedValueOnce(startingServerResponse).mockResolvedValueOnce(startingServerPeersResponse);

    // mock console.log to assert it prints extected results
    // (that only 1 node has been visited, but both nodes have been saved)
    console.log = jest.fn();

    insertNodeMock.mockResolvedValue();
    insertConnectionMock.mockResolvedValue();
    updateVersionUptimeAndPublisherMock.mockResolvedValue();

    await new Crawler([startingServerIP]).setVerboseLevel(10).crawl();

    const insertedNodes = [
        // the initial node
        {
            ip: startingServerIP,
            port: DEFAULT_PEER_PORT,
            version: "rippled-1.7.0",
            pubkey: "n9KFUrM9FmjpnjfRbZkkYTnqHHvp2b4u1Gqts5EscbSQS2Fpgz16",
            uptime: 1234567,
            publishers: ["ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"],
            _visited: true
        },
        // the initial node's peer
        // since it has an undefined IP it cannot be visited
        // (so _visited will be false and it will not have a publisher)
        {
            ip: undefined,
            port: DEFAULT_PEER_PORT,        // the undefined peer port should be substituted with the default peer port
            version: "rippled-1.6.0",
            pubkey: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFzE",
            uptime: 123456,
            _visited: false
        }
    ];

    // insertNode() should have been called twice; once for each inserted node
    expect(insertNodeMock).toHaveBeenCalledTimes(2);
    expect(insertNodeMock).toHaveBeenNthCalledWith(1, insertedNodes[0]);
    expect(insertNodeMock).toHaveBeenNthCalledWith(2, insertedNodes[1]);

    // only the initial node should have been visited, so only it should be updated
    expect(updateVersionUptimeAndPublisherMock).toHaveBeenCalledTimes(1);
    expect(updateVersionUptimeAndPublisherMock).toHaveBeenNthCalledWith(1, insertedNodes[0]);

    // a connection between the two nodes should be inserted in the database
    expect(insertConnectionMock).toHaveBeenCalledTimes(2);
    expect(insertConnectionMock).toHaveBeenCalledWith(insertedNodes[0], insertedNodes[1]);
    expect(insertConnectionMock).toHaveBeenCalledWith(insertedNodes[1], insertedNodes[0]);

    expect(console.log).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenNthCalledWith(1, "How many nodes we have visited: 1\nHow many UNIQUE IPs we have visited: 1"); // only 1 node should have been "visited" (the other has an undefined IP)
    expect(console.log).toHaveBeenNthCalledWith(2, "How many nodes we have saved: 2"); // both nodes should have been saved

    console.log = console_log;
});

test("test crawl() should not overwrite a known IP address to undefined", async () => {
    const startingServerIP = "1.2.3.4";
    const startingServerPublicKey = "n9KFUrM9FmjpnjfRbZkkYTnqHHvp2b4u1Gqts5EscbSQS2Fpgz16";
    const startingServerResponse = {
        data: {
            server: {
                build_version: "1.7.0",
                pubkey_node: startingServerPublicKey,
                uptime: 1234567
            },
            unl: {
                publisher_lists: [{
                   pubkey_publisher: "ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"
                }]
            }

        }
    };

    const startingServerPeersResponse = {
        data: {
            overlay: {
                active: [{
                    ip: "1.1.0.0",
                    port: 51234,
                    version: "rippled-1.6.0",
                    public_key: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFzE",
                    uptime: 123456
                },
                {
                    ip: undefined,      // this node does not know the IP of the initial node, but the IP of the initial node should be known
                    // by the crawler and should not be overwritten
                    port: DEFAULT_PEER_PORT,
                    version: "rippled-1.6.0",       // the version information that this node has is also outdated, and should not be overwritten in the crawler!
                    public_key: startingServerPublicKey,
                    uptime: 1234989
                }
                ]
            },
            unl: {
                publisher_lists: [{
                   pubkey_publisher: "ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"
                }]
            },
            server: {
                build_version: "1.7.0",
                uptime: 1234567
            }
        }
    };

    // resolve the first axios request with the mocked startingServerResponse object,
    // and the second axios request gets the starting server's peer
    axiosMock.get.mockResolvedValueOnce(startingServerResponse).mockResolvedValueOnce(startingServerPeersResponse).mockRejectedValue(new Error("Server not responding"));

    // mock console.log to assert it prints extected results
    // (that only 2 nodes have been visited, and both nodes have been saved)
    // the initial node should not have its IP overwritten to undefined
    console.log = jest.fn();

    insertNodeMock.mockResolvedValue();
    insertConnectionMock.mockResolvedValue();
    updateVersionUptimeAndPublisherMock.mockResolvedValue();

    await new Crawler([startingServerIP]).setVerboseLevel(10).crawl();

    const insertedNodes = [
        // the initial node
        {
            ip: startingServerIP,
            port: DEFAULT_PEER_PORT,
            version: "rippled-1.7.0",
            pubkey: startingServerPublicKey,
            uptime: 1234567,
            publishers: ["ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"],
            _visited: true
        },
        // the initial node's peer
        {
            ip: "1.1.0.0",
            port: 51234,
            version: "rippled-1.6.0",
            pubkey: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFzE",
            uptime: 123456,
            _visited: false
        }
    ];

    // insertNode() should have been called twice; once for each inserted node
    expect(insertNodeMock).toHaveBeenCalledTimes(2);
    expect(insertNodeMock).toHaveBeenNthCalledWith(1, insertedNodes[0]);
    expect(insertNodeMock).toHaveBeenNthCalledWith(2, insertedNodes[1]);

    // only the initial node should have been visited, so only it should be updated
    expect(updateVersionUptimeAndPublisherMock).toHaveBeenCalledTimes(1);
    expect(updateVersionUptimeAndPublisherMock).toHaveBeenNthCalledWith(1, insertedNodes[0]);

    // a connection between the two nodes should be inserted in the database
    expect(insertConnectionMock).toHaveBeenCalledTimes(2);
    expect(insertConnectionMock).toHaveBeenCalledWith(insertedNodes[0], insertedNodes[1]);
    expect(insertConnectionMock).toHaveBeenCalledWith(insertedNodes[1], insertedNodes[0]);

    expect(console.log).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenNthCalledWith(1, "How many nodes we have visited: 2\nHow many UNIQUE IPs we have visited: 2");
    expect(console.log).toHaveBeenNthCalledWith(2, "How many nodes we have saved: 2");

    console.log = console_log;
});


test("test crawl() for nodes with many peers", async () => {
    const startingServerIP = "1.2.3.4";
    const startingServerPublicKey = "n9KFUrM9FmjpnjfRbZkkYTnqHHvp2b4u1Gqts5EscbSQS2Fpgz16";
    const startingServerResponse = {
        data: {
            server: {
                build_version: "1.7.0",
                pubkey_node: startingServerPublicKey,
                uptime: 1234567
            },
            unl: {
                publisher_lists: [{
                   pubkey_publisher: "ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"
                }]
            }
        }
    };

    const startingServerPeersResponse = {
        data: {
            overlay: {
                active: [{
                    ip: "1.1.0.0",
                    port: 51234,
                    version: "rippled-1.6.0",
                    public_key: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFzE",
                    uptime: 123456
                },
                {
                    ip: undefined,
                    port: DEFAULT_PEER_PORT,
                    version: "rippled-1.6.0",
                    public_key: startingServerPublicKey,
                    uptime: 1234989
                },
                {
                    ip: "1.0.0.0",
                    port: 51234,
                    version: "rippled-1.6.0",
                    public_key: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFdf",
                    uptime: 124458
                },
                {
                    ip: undefined,
                    port: DEFAULT_PEER_PORT,
                    version: "rippled-1.6.0",
                    public_key: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFdr",
                    uptime: 1234989
                }
                ]
            },
            unl: {
                publisher_lists: [{
                   pubkey_publisher: "ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"
                }]
            },
            server: {
                build_version: "1.7.0",
                uptime: 1234567
            }
        }
    };

    const startingServerPeersResponse2 = {
        data: {
            overlay: {
                active: [{
                    ip: "2.2.2.2",
                    port: 51236,
                    version: "rippled-1.6.1",
                    public_key: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFzq",
                    uptime: 123456
                },
                {
                    ip: "1.2.2.2",
                    port: DEFAULT_PEER_PORT,
                    version: "rippled-1.6.4",
                    public_key: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFd3",
                    uptime: 1234984
                },
                {
                    ip: "1.0.0.0",
                    port: 51234,
                    version: "rippled-1.7.0",
                    public_key: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFdf",
                    uptime: 124458
                },
                {
                    ip: "2.3.4.7",
                    port: undefined,
                    version: "rippled-1.4.0",
                    public_key: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFd6",
                    uptime: 123
                },
                {
                    ip: undefined,
                    port: undefined,
                    version: "rippled-1.5.0",
                    public_key: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFzm",
                    uptime: 99998
                }
                ]
            },
            unl: {
                publisher_lists: [{
                   pubkey_publisher: "ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"
                }]
            },
            server: {
                build_version: "1.6.0",
                uptime: 123456
            }
        }
    };


    // simulate a network with many interconnected nodes
    // (actually "visit" 2 nodes: the initial node and its first peers; each axios request after that will be rejected)
    axiosMock.get.mockResolvedValueOnce(startingServerResponse).mockResolvedValueOnce(startingServerPeersResponse).mockResolvedValueOnce(startingServerPeersResponse2).mockRejectedValue(new Error("Server not responding"));

    // mock console.log to assert it prints extected results
    console.log = jest.fn();

    insertNodeMock.mockResolvedValue();
    insertConnectionMock.mockResolvedValue();
    updateVersionUptimeAndPublisherMock.mockResolvedValue();

    await new Crawler([startingServerIP]).crawl();

    const insertedNodes = [
        // the initial node
        {
            ip: startingServerIP,
            port: DEFAULT_PEER_PORT,
            version: "rippled-1.7.0",
            pubkey: startingServerPublicKey,
            uptime: 1234567,
            publishers: ["ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"],
            _visited: true
        },
        // the initial node's peer
        {
            ip: "1.1.0.0",
            port: 51234,
            version: "rippled-1.6.0",
            pubkey: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFzE",
            uptime: 123456,
            publishers: ["ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"],
            _visited: true
        },
        {
            ip: "1.0.0.0",
            port: 51234,
            version: "rippled-1.6.0",
            pubkey: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFdf",
            uptime: 124458,
            _visited: false
        },
        {
            ip: undefined,
            port: DEFAULT_PEER_PORT,
            version: "rippled-1.6.0",
            pubkey: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFdr",
            uptime: 1234989,
            _visited: false
        },
        {
            ip: "2.2.2.2",
            port: 51236,
            version: "rippled-1.6.1",
            pubkey: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFzq",
            uptime: 123456,
            _visited: false
        },
        {
            ip: "1.2.2.2",
            port: DEFAULT_PEER_PORT,
            version: "rippled-1.6.4",
            pubkey: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFd3",
            uptime: 1234984,
            _visited: false
        },
        {
            ip: "2.3.4.7",
            port: DEFAULT_PEER_PORT,
            version: "rippled-1.4.0",
            pubkey: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFd6",
            uptime: 123,
            _visited: false
        },
        {
            ip: undefined,
            port: DEFAULT_PEER_PORT,
            version: "rippled-1.5.0",
            pubkey: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFzm",
            uptime: 99998,
            _visited: false
        }
    ];

    expect(insertNodeMock).toHaveBeenCalledTimes(8);
    expect(insertNodeMock).toHaveBeenNthCalledWith(1, insertedNodes[0]);
    expect(insertNodeMock).toHaveBeenNthCalledWith(2, insertedNodes[1]);
    expect(insertNodeMock).toHaveBeenNthCalledWith(3, insertedNodes[2]);
    expect(insertNodeMock).toHaveBeenNthCalledWith(4, insertedNodes[3]);
    expect(insertNodeMock).toHaveBeenNthCalledWith(5, insertedNodes[4]);
    expect(insertNodeMock).toHaveBeenNthCalledWith(6, insertedNodes[5]);
    expect(insertNodeMock).toHaveBeenNthCalledWith(7, insertedNodes[6]);
    expect(insertNodeMock).toHaveBeenNthCalledWith(8, insertedNodes[7]);

    // the two visited nodes should be updated
    expect(updateVersionUptimeAndPublisherMock).toHaveBeenCalledTimes(2);
    expect(updateVersionUptimeAndPublisherMock).toHaveBeenNthCalledWith(1, insertedNodes[0]);
    expect(updateVersionUptimeAndPublisherMock).toHaveBeenNthCalledWith(2, insertedNodes[1]);

    // a connection between the two nodes should be inserted in the database
    // since a connection will be inserted before the second node is visited, it should not yet have a publisher key
    // and _visited should be false for each peer node
    expect(insertConnectionMock).toHaveBeenCalledTimes(14);

    // save the initial node's peer publisher because after this node is visited, it will have a publisher
    const peerNodePublisher = insertedNodes[1].publishers;
    insertedNodes[1]._visited = false;
    insertedNodes[1].publishers = undefined;
    expect(insertConnectionMock).toHaveBeenNthCalledWith(1, insertedNodes[0], insertedNodes[1]);
    expect(insertConnectionMock).toHaveBeenNthCalledWith(2, insertedNodes[1], insertedNodes[0]);

    expect(insertConnectionMock).toHaveBeenNthCalledWith(3, insertedNodes[0], insertedNodes[2]);
    expect(insertConnectionMock).toHaveBeenNthCalledWith(4, insertedNodes[2], insertedNodes[0]);

    expect(insertConnectionMock).toHaveBeenNthCalledWith(5, insertedNodes[0], insertedNodes[3]);
    expect(insertConnectionMock).toHaveBeenNthCalledWith(6, insertedNodes[3], insertedNodes[0]);

    // retrieve the initial node's peer's publisher from the cache, because after it is visited and an http get request is sent to it, it will have a publisher
    insertedNodes[1]._visited = true;
    insertedNodes[1].publishers = peerNodePublisher;
    expect(insertConnectionMock).toHaveBeenNthCalledWith(7, insertedNodes[1], insertedNodes[4]);
    expect(insertConnectionMock).toHaveBeenNthCalledWith(8, insertedNodes[4], insertedNodes[1]);

    expect(insertConnectionMock).toHaveBeenNthCalledWith(9, insertedNodes[1], insertedNodes[5]);
    expect(insertConnectionMock).toHaveBeenNthCalledWith(10, insertedNodes[5], insertedNodes[1]);

    expect(insertConnectionMock).toHaveBeenNthCalledWith(11, insertedNodes[1], insertedNodes[6]);
    expect(insertConnectionMock).toHaveBeenNthCalledWith(12, insertedNodes[6], insertedNodes[1]);

    expect(insertConnectionMock).toHaveBeenNthCalledWith(13, insertedNodes[1], insertedNodes[7]);
    expect(insertConnectionMock).toHaveBeenNthCalledWith(14, insertedNodes[7], insertedNodes[1]);

    expect(console.log).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenNthCalledWith(1, "How many nodes we have visited: 6\nHow many UNIQUE IPs we have visited: 6");
    expect(console.log).toHaveBeenNthCalledWith(2, "How many nodes we have saved: 8");

    console.log = console_log;
});

test("test crawl() if the database is unresponsive", async () => {
    const startingServerIP = "1.2.3.4";
    const startingServerResponse = {
        data: {
            server: {
                build_version: "1.7.0",
                pubkey_node: "n9KFUrM9FmjpnjfRbZkkYTnqHHvp2b4u1Gqts5EscbSQS2Fpgz16",
                uptime: 1234567
            },
            unl: {
                publisher_lists: [{
                   pubkey_publisher: "ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"
                }]
            }
        }
    };

    const startingServerPeersResponse = {
        data: {
            overlay: {
                active: [{
                    ip: "1.1.1.1",
                    port: 51235,
                    version: "rippled-1.6.0",
                    public_key: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFzE",
                    uptime: 123456
                },
                {
                    ip: undefined,
                    port: 51235,
                    version: "rippled-1.6.0",
                    public_key: "n9Jcqat79YaQBFmtFTo2uQMGQ8TCf6Hc8MvVfG7ZLb5mWFVmXFzE",
                    uptime: 123456
                }
                ]
            },
            unl: {
                publisher_lists: [{
                   pubkey_publisher: "ED2677ABFFD1B33AC6FBC3062B71F1E8397C1505E1C42C64D11AD1B28FF73F4734"
                }]
            },
            server: {
                build_version: "1.7.0",
                uptime: 1234567
            }
        }
    };

    // reject all axios.get() requests
    axiosMock.get.mockResolvedValueOnce(startingServerResponse).mockResolvedValue(startingServerPeersResponse);

    // mock console.log which will be called if no starting servers respond
    console.log = jest.fn();
    console.error = jest.fn();

    // initialize a new crawler with 3 test IPs that will be mocked
    const crawler = new Crawler([startingServerIP]);
    const spy = jest.spyOn(crawler, "crawl");

    insertNodeMock.mockRejectedValue(new Error("Database unresponsive."));
    insertConnectionMock.mockRejectedValue(new Error("Database unresponsive."));
    updateVersionUptimeAndPublisherMock.mockRejectedValue(new Error("Database unresponsive."));

    // wait for the Promises that axios returns
    await crawler.setVerboseLevel(10).crawl();

    // crawler.crawl() should have been called 1 time (because the insertNode() and insertConnection() functions should catch their own exceptions)
    expect(spy).toHaveBeenCalledTimes(1);

    // console.log will still be called twice when the crawler returns, because the crawler is unaware that the database is unresponsive
    expect(console.log).toHaveBeenCalledTimes(2);

    // the 3 different instances on insertNode() should all have been called once
    expect(insertNodeMock).toHaveBeenCalledTimes(3);

    // the two visited nodes should be updated
    expect(updateVersionUptimeAndPublisher).toHaveBeenCalledTimes(2);

    // the 2 instances of insertConnection() should each have been called twice
    // (the initial node should have a bidirectional connection with each of its peers)
    expect(insertConnectionMock).toHaveBeenCalledTimes(4);

    // the logger should have been called 9 times (once for each rejected promise)
    expect(Logger.error).toHaveBeenCalledTimes(9);

    spy.mockRestore();
    console.log = console_log;
});
