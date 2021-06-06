import GeoLocate from './geoLocate';
import config from './config/config.json';
import { getAllNodesWithoutLocation, insertLocation } from './db_connection/db_helper';
import geoip, { Lookup } from 'geoip-lite';

jest.mock('geoip-lite');
const geoipMock = geoip as jest.Mocked<typeof geoip>;

// mock the db helper functions used in geoLocate.ts
jest.mock('./db_connection/db_helper');
const getAllNodesWithoutLocationMock = getAllNodesWithoutLocation as jest.MockedFunction<typeof getAllNodesWithoutLocation>;
const insertLocationMock = insertLocation as jest.MockedFunction<typeof insertLocation>;

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

        // also test the setIPList() method
        const newIPList = ["0.0.0.0"];
        geoLocate.setIPList(newIPList);
        expect(geoLocate.IPList).toBe(newIPList);

    });
});

test("test locate() with 2 successful geoip lookups", async () => {
    // TODO mock Logger and console.log
    const IPList = ["1.2.3.4", "8.8.0.0"];

    const geoLocate = new GeoLocate(IPList);
    const nodesWithoutLocation = [
        {
            IP: IPList[0]
        },
        {
            IP: IPList[1]
        }
    ];
    getAllNodesWithoutLocationMock.mockResolvedValue(nodesWithoutLocation);
    const loc1 = [1, 2];
    const loc2 = [8, 8];
    // mock geoip to return loc1 for the first IP and loc2 for the second IP
    geoipMock.lookup.mockImplementation((ip) => {
        if (ip === IPList[0])
            return <Lookup> <unknown> { ll: loc1 };
        else if(ip === IPList[1])
            return <Lookup> <unknown> { ll: loc2 };
        return <Lookup> <unknown> { ll: [null, null] };
    });

    insertLocationMock.mockResolvedValue();
    const getDataSpy = jest.spyOn(geoLocate, "getData");
    await geoLocate.locate();

    expect(getDataSpy).toHaveBeenCalledTimes(2);
    expect(getDataSpy).toHaveBeenNthCalledWith(1, IPList[0]);
    expect(getDataSpy).toHaveBeenNthCalledWith(2, IPList[1]);
    expect(insertLocationMock).toHaveBeenCalledTimes(2);
    expect(insertLocationMock).toHaveBeenNthCalledWith(1, loc1, IPList[0]);
    expect(insertLocationMock).toHaveBeenNthCalledWith(2, loc2, IPList[1]);
});
