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
    expect(console.log).toHaveBeenCalledTimes(3);
    console.log = console_log;
});
