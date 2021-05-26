import Crawler from "./crawl";

// save console.error and console.log to restore them after mocking them in some tests
const console_error = console.error;
const console_log = console.log;
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
