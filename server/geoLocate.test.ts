import GeoLocate from './geoLocate';
import config from './config/config.json';

beforeEach(() => {
    config.useIPStack = false;
});

afterEach(() => {
      jest.clearAllMocks();
});

describe("test get locator constructor", () => {
    it("without parameters", () => {
        const IPList = ["1.2.3.4", "8.8.8.8"];

        // mock the getIPsFromDB() function because it requires a connection to the database
        //  and cannot be tested without the locate() function
        GeoLocate.prototype.getIPsFromDB = jest.fn().mockImplementationOnce(() => IPList);
        const geoLocate = new GeoLocate();

        expect(geoLocate.useIPStack).toBe(false);
        expect(geoLocate.IPList).toBe(IPList);
    });

    it("with a list of IPs as a parameter", () => {
        const IPList = ["1.2.3.4", "8.8.8.8"];

        // no need to mock getIPsFromDB() when the IPs are provided
        const geoLocate = new GeoLocate(IPList);

        expect(geoLocate.useIPStack).toBe(false);
        expect(geoLocate.IPList).toBe(IPList);
    });
});

