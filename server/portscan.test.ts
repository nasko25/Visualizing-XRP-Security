import PortScanner from './portScan';
import NmapInterface from './nmapInterface';
interface Node {
    ip: string;
    openPorts: ProtocolPortid[];
    up: boolean;
}
interface ProtocolPortid {
    protocol: string;
    portid: string;
}
// save console.error and console.log to restore them after mocking them in some tests
const console_error = console.error;
const console_log = console.log;
// Mock the NMAP interface
jest.mock('./nmapInterface');
const nmapMock = NmapInterface as jest.MockedClass<typeof NmapInterface>;

// mock the db helper
import { insertPorts, getNodesNonNullPort,getAllNodesForPortScan } from './db_connection/db_helper';
jest.mock('./db_connection/db_helper');

const insertPortsMock = insertPorts as jest.MockedFunction<typeof insertPorts>;
const getNodesNonNullPortMock = getNodesNonNullPort as jest.MockedFunction<typeof getNodesNonNullPort>;
const getAllNodesForPortScanMock = getAllNodesForPortScan as jest.MockedFunction<typeof getAllNodesForPortScan>;
// the logger should be mocked to test the promise rejection of insertNode() and insertConnection()



afterEach(() => {
    jest.clearAllMocks();
});

//172.26.0.1 Funny little IP

test("test normalizeIP function", () => {
    // test if we normalize IPs properly,
    const pscn = new PortScanner(new NmapInterface());
    expect(pscn.normaliseIP("192.168.2.452")).toBe("192.168.2.452");
    //console.log("HEREEEEE "+pscn.normaliseIP("::ffff:192.168.2.452"))
    expect(pscn.normaliseIP("::ffff:192.168.2.452")).toBe("192.168.2.452");
    
    expect(pscn.normaliseIP("ffff:fff0:fffa:f52f:ffba:ffff:ffff")).toBe("ffff:fff0:fffa:f52f:ffba:ffff:ffff");
});

test("test getDate function", () => {
    // test if we get a new date properly
    const pscn = new PortScanner(new NmapInterface());
    const dt = new Date();
    var x = 2;
    var differenceCounter = 0;
    for(var i = 0; i<10; i++){
        var buffDate = pscn.getRandomDate(x)
        expect(buffDate>dt).toBe(true);
        expect(buffDate.getTime()- dt.getTime()>1000*60*60*24*(x-1)).toBe(true);
        if(buffDate.getHours()!=dt.getHours()&&buffDate.getMinutes()!=dt.getMinutes()){
            differenceCounter++;
        }
        x++;
    }
    //at least third of the tiems be both different. Odds of them being the same is less than 1 in 10.
    expect(differenceCounter>3).toBe(true);
});

test("Do a shortScan", async () => {
    // test if we get a new date properly
    
    insertPortsMock.mockRejectedValue(false);
    insertPortsMock.mockResolvedValue();
    nmapMock.prototype.topPortsScan.mockResolvedValue({ip: '127.9.42.1', openPorts: [{portid: '44', protocol:'dcp'}], up: true})
    nmapMock.prototype.checkSpecificports.mockResolvedValue({ip: '127.9.42.1', openPorts: [{portid: '42', protocol:'dcp'}], up: true})
    const nmpintrf = new nmapMock;
    const pscn = new PortScanner(nmpintrf);
    
    var retTest = false;
    getNodesNonNullPortMock.mockResolvedValue([{ip: '127.9.42.1', portRunningOn: '44', public_key:'bs', ports:'44' }]);
    pscn.setList([{ip: '127.9.42.1', portRunningOn: '44', public_key:'bs', ports:'44' }]);
    await pscn.shortScanPromiseMaker(0).then((valret)=>{
        retTest = valret;
        
    }).catch((reason)=>console.log(reason));
    expect(insertPortsMock.mock.calls[0][0]).toStrictEqual({ip: '127.9.42.1',ports:"42,44", protocols: "dcp,dcp", public_key:"bs"})
    expect(retTest).toBe(true);
    expect(insertPortsMock).toBeCalledTimes(1);
    expect(nmpintrf.topPortsScan).toBeCalledTimes(1);
    expect(nmpintrf.checkSpecificports).toBeCalledTimes(1);
});

test("fail a shortScan", async () => {
    // test if we fail short scan properly
    insertPortsMock.mockRejectedValue(false);
    insertPortsMock.mockResolvedValue();
    nmapMock.prototype.topPortsScan.mockResolvedValue({ip: '127.9.42.1', openPorts: [{portid: '44', protocol:'dcp'}], up: false})
    nmapMock.prototype.checkSpecificports.mockResolvedValue({ip: '127.9.42.1', openPorts: [{portid: '44', protocol:'dcp'}], up: false})
    const nmpintrf = new nmapMock;
    const pscn = new PortScanner(nmpintrf);
    var retTest = true;
   
    getNodesNonNullPortMock.mockResolvedValue([{ip: '127.9.42.1', portRunningOn: '44', public_key:'bs', ports:'44' }]);
    pscn.setList([{ip: '127.9.42.1', portRunningOn: '44', public_key:'bs', ports:'44' }]);
    
    await pscn.shortScanPromiseMaker(0).then((valret)=>{
        console.log(pscn.shortScanList)
        retTest=valret;
    });
    expect(retTest).toBe(false);
    expect(insertPortsMock).toBeCalledTimes(0);
    expect(nmpintrf.topPortsScan).toBeCalledTimes(1);
    expect(nmpintrf.checkSpecificports).toBeCalledTimes(1);
    
});

test("Finish port scan promises", async () => {
    // test if we schedule new batch properly
    
    
    nmapMock.prototype.topPortsScan.mockResolvedValue({ip: '127.9.42.1', openPorts: [{portid: '44', protocol:'dcp'}], up: true})
    nmapMock.prototype.checkSpecificports.mockResolvedValue({ip: '127.9.42.1', openPorts: [{portid: '44', protocol:'dcp'}], up: true})
    const nmpintrf = new nmapMock;
   // ret.topPortsScan.mockResolvedValueOnce({ip: '127.9.42.1', openPorts: [{portid: '44', protocol:'dcp'}], up: true}).mockReturnValueOnce(new Promise((resolve)=>resolve({ip: '127.9.42.1', openPorts: [{portid: '44', protocol:'dcp'}], up: true})));
    const pscn = new PortScanner(nmpintrf);
    
    const spy = spyOn(pscn,"scheduleAShortScanver2")
    getNodesNonNullPortMock.mockResolvedValue([{ip: '127.9.42.1', portRunningOn: '44', public_key:'bs', ports:'44' }]);
    pscn.setList([{ip: '127.9.42.1', portRunningOn: '44', public_key:'bs', ports:'44' }, {ip: '142.9.1.1', portRunningOn: '42', public_key:'baa', ports:'41' }]);
    await pscn.shortScanver2(5);
    expect(nmpintrf.topPortsScan).toBeCalledTimes(0);
    expect(spy).toBeCalledTimes(1);
});