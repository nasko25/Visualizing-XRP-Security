import NodePageMain from '../components/node-page/NodePageMain';
import axios from 'axios';
import { createBrowserHistory, History } from 'history';
import { Peer, NodeInfoDB, PeerNodeDB } from '../components/node-page/NodePageTypes';
import { shallow } from 'enzyme';

//---------------SETUP AND CLEAN UP---------------//

// Mock the peer graph
jest.mock("../components/node-page/NodePeerGraph");

// Mock axios
jest.mock("axios");
const axiosMock = axios as jest.Mocked<typeof axios>;

afterEach(() => {
    jest.clearAllMocks();
});

const mockNodeInfo: NodeInfoDB = {
    public_key: "n9KFUrM9FmjpnjfRbZkkYTnqHHvp2b4u1Gqts5EscbSQS2Fpgz16",
    ip: "bruh",
    latitude: 42,
    longtitude: 42,
    ports: "42",
    protocols: "HTTP",
    rippled_version: '1.6.0',
    timestamp: "never",
    uptime: 42,
    score: 85,
    history: [{average_score: 0, date: new Date("17/6/2021")}]
};

const mockData = {
    data: [mockNodeInfo]
}
/**
 * TODO
 * Once we update the API these should also contain a score
 */
const mockNodePeers: PeerNodeDB[] = [
    { 
        public_key: "n9MGChK9EgiCBM6s15EwF9d6m4LWZHh1UnJcgr16kQr4xBpx71fS",
        metric_version: "0.1.0",
        score: 100,
        timestamp: new Date()
    },
    { 
        public_key: "n9Jy88tMgEhHocG9hZssgsYRmTz9CjCgjp3DiqzSgYqrp4BxTE11",
        metric_version: "0.2.0",
        score: 50,
        timestamp: new Date()
    },
];

const mockPeersData = {
    data: mockNodePeers
}

test('Correct behaviour on API node info call success', async () => {

    // Mock the axios response as resolution
    axiosMock.get.mockResolvedValue(mockData);    

    // Shallowly render the node page
    let history: History = createBrowserHistory();
    history.push('/node?public_key=' + mockNodeInfo.public_key);

    const node_page = await shallow<NodePageMain>(<NodePageMain history={history} />).instance();

    // Set up some spies
    const componentDidMountSpy = jest.spyOn(node_page, "componentDidMount");
    const setStateSpy = jest.spyOn(node_page, "setState");
    const getNodeInfoSpy = jest.spyOn(node_page, "getNodeInfo");

    // Make the call to the function
    await node_page.queryAPI_node(mockNodeInfo.public_key);
    
    // Make sure nothing is called in excess
    expect(getNodeInfoSpy).toHaveBeenCalledTimes(0);
    expect(componentDidMountSpy).toHaveBeenCalledTimes(0);
    expect(setStateSpy).toHaveBeenCalled();

    // See if everything in the state is correctly updated
    expect(node_page.state.IP).toEqual(mockNodeInfo.ip);
    expect(node_page.state.rippled_version).toEqual(mockNodeInfo.rippled_version);
    expect(node_page.state.ports).toEqual([{port_number: 42, service: "HTTP", version: "Not Implemented yet"}]);
    expect(node_page.state.uptime).toEqual(mockNodeInfo.uptime);
});

test('Correct behaviour on API node info call failure', async () => {

    // Mock the axios response as rejection
    axiosMock.get.mockRejectedValue(new Error('404 Not Found'));   

    // Shallowly render the node page
    let history: History = createBrowserHistory();
    history.push('/node?public_key=' + mockNodeInfo.public_key);

    const node_page = await shallow<NodePageMain>(<NodePageMain history={history} />).instance();

    // Set up some spies
    const componentDidMountSpy = jest.spyOn(node_page, "componentDidMount");
    const setStateSpy = jest.spyOn(node_page, "setState");
    const getNodeInfoSpy = jest.spyOn(node_page, "getNodeInfo");

    // Make the call to the function
    await node_page.queryAPI_node(mockNodeInfo.public_key);
    
    // Make sure nothing is called
    expect(getNodeInfoSpy).toHaveBeenCalledTimes(0);
    expect(componentDidMountSpy).toHaveBeenCalledTimes(0);
    expect(setStateSpy).toHaveBeenCalledTimes(0);
});

test('Correct behaviour on API node info call empty response (a.k.a we did not find the node on the server side)', async () => {

    // Mock the axios response as resolution
    axiosMock.get.mockResolvedValueOnce(mockData).mockResolvedValueOnce(mockPeersData);  

    // Shallowly render the node page
    let history: History = createBrowserHistory();
    history.push('/node?public_key=' + mockNodeInfo.public_key);

    const node_page = await shallow<NodePageMain>(<NodePageMain history={history} />).instance();

    // Set up some spies
    const componentDidMountSpy = jest.spyOn(node_page, "componentDidMount");
    const setStateSpy = jest.spyOn(node_page, "setState");
    const getNodeInfoSpy = jest.spyOn(node_page, "getNodeInfo");

    axiosMock.get.mockResolvedValue({data: []});
    
    // Make the call to the function
    await node_page.queryAPI_node(mockNodeInfo.public_key);
    
    // Make sure nothing is called in excess
    expect(getNodeInfoSpy).toHaveBeenCalledTimes(0);
    expect(componentDidMountSpy).toHaveBeenCalledTimes(0);
    expect(setStateSpy).toHaveBeenCalledTimes(0);
});

test('Correct behaviour on API node info call failure', async () => {

    // Mock the axios response as rejection
    axiosMock.get.mockRejectedValue(new Error('404 Not Found'));   

    // Shallowly render the node page
    let history: History = createBrowserHistory();
    history.push('/node?public_key=' + mockNodeInfo.public_key);

    const node_page = await shallow<NodePageMain>(<NodePageMain history={history} />).instance();

    // Set up some spies
    const componentDidMountSpy = jest.spyOn(node_page, "componentDidMount");
    const setStateSpy = jest.spyOn(node_page, "setState");
    const getNodeInfoSpy = jest.spyOn(node_page, "getNodeInfo");

    // Make the call to the function
    await node_page.queryAPI_node(mockNodeInfo.public_key);
    
    // Make sure nothing is called
    expect(getNodeInfoSpy).toHaveBeenCalledTimes(0);
    expect(componentDidMountSpy).toHaveBeenCalledTimes(0);
    expect(setStateSpy).toHaveBeenCalledTimes(0);
});


/**
 * TODO
 * This test should be made to pass once we have finalized the scores
 */
test('Correct behaviour on API peer call success', async () => {

    // When rendering, there are 2 request that take place and we mock them
    axiosMock.get.mockResolvedValueOnce(mockData).mockResolvedValue(mockPeersData);
    // axiosMock.get.mockResolvedValue(mockPeersData);
    let history: History = createBrowserHistory();
    history.push('/node?public_key=' + mockNodeInfo.public_key);
    const node_page = await shallow<NodePageMain>(<NodePageMain history={history} />).instance();

    await node_page.queryAPI_peers("");
    
    // expect(node_page.state.peers).toContain({ public_key: mockNodePeers[0].end_node, score: 1 });
    expect(node_page.state.peers).toHaveLength(2);
});

test('Create peer list returns correct List element with 0 peers', async () => {

    axiosMock.get.mockResolvedValueOnce(mockData).mockResolvedValueOnce({ data: [] });

    let history: History = createBrowserHistory();
    history.push('/node?public_key=' + mockNodeInfo.public_key);
    const node_page = await shallow<NodePageMain>(<NodePageMain history={history} />).instance();

    const list = node_page.createPeerTable();
    await node_page.setState({ peers: []});

    expect(list.props.data).toHaveLength(0);
});

test('Create peer list returns correct List element with multiple peers', async () => {

    axiosMock.get.mockResolvedValueOnce(mockData).mockResolvedValueOnce(mockPeersData);

    let history: History = createBrowserHistory();
    history.push('/node?public_key=' + mockNodeInfo.public_key);
    const node_page = await shallow<NodePageMain>(<NodePageMain history={history} />).instance();
    
    let peers: Peer[] = mockNodePeers.map((p, index) => {
         return {idx: index+1, public_key: p.public_key, score: 1, timestamp: p.timestamp}
        }
    );

    const setStateSpy = jest.spyOn(node_page, "setState");
    await node_page.setState({ peers: peers } );
    const list = node_page.createPeerTable();
    
    expect(setStateSpy).toHaveBeenCalledTimes(1);
    expect(node_page.state.peers).toHaveLength(2);
    expect(list.props.data).toHaveLength(peers.length);
    
    expect(list.props.data[0].public_key).toEqual(peers[0].public_key);
    expect(list.props.data[0].idx).toEqual(1);
    expect(list.props.data[0].score).toEqual(peers[0].score);
    expect(list.props.data[0].timestamp).toEqual(String(peers[0].timestamp).slice(0, 10));

    expect(list.props.data[1].public_key).toEqual(peers[1].public_key);
    expect(list.props.data[1].idx).toEqual(2);
    expect(list.props.data[1].score).toEqual(peers[1].score);
    expect(list.props.data[1].timestamp).toEqual(String(peers[1].timestamp).slice(0, 10));
});

test('Correct behaviour of getNodeInfo on both request success', async () => {
    // Mock the axios response as resolution
    axiosMock.get.mockResolvedValueOnce(mockData).mockResolvedValueOnce(mockPeersData);

    // Shallowly render the node page
    let history: History = createBrowserHistory();
    history.push('/node?public_key=' + mockNodeInfo.public_key);

    const node_page = await shallow<NodePageMain>(<NodePageMain history={history} />).instance();

    // Mock the axios response once for the node info request and once for the peer request
    axiosMock.get.mockResolvedValueOnce(mockData).mockResolvedValueOnce(mockPeersData);

    // const componentDidMountSpy = jest.spyOn(node_page, "componentDidMount");
    const setStateSpy = jest.spyOn(node_page, "setState");
    const queryAPI_nodeSpy = jest.spyOn(node_page, "queryAPI_node");
    const queryAPI_peersSpy = jest.spyOn(node_page, "queryAPI_peers");
    const getNodeInfoSpy = jest.spyOn(node_page, "getNodeInfo");

    await node_page.getNodeInfo();

    expect(setStateSpy).toHaveBeenCalledTimes(2);
    expect(queryAPI_nodeSpy).toHaveBeenCalledTimes(1);
    expect(queryAPI_peersSpy).toHaveBeenCalledTimes(1);
    expect(getNodeInfoSpy).toHaveBeenCalledTimes(1);

    expect(node_page.state.IP).toEqual(mockNodeInfo.ip);
    expect(node_page.state.rippled_version).toEqual(mockNodeInfo.rippled_version);
    expect(node_page.state.ports).toEqual([{port_number: 42, service: "HTTP", version: "Not Implemented yet"}]);
    expect(node_page.state.uptime).toEqual(mockNodeInfo.uptime);

    // expect(node_page.state.peers).toContain({ public_key: mockNodePeers[0].end_node, score: 1 });
    expect(node_page.state.peers).toHaveLength(2);
});

/**
 * This test fails, because we still don't have a method to query the score history of a node
 */
test('Correct behaviour of getNodeInfo on both requests failure', async () => {
    // Mock all axios responses as reject
    axiosMock.get.mockRejectedValue(new Error("404 Not Found"));

    // Shallowly render the node page
    let history: History = createBrowserHistory();
    history.push('/node?public_key=' + mockNodeInfo.public_key);

    const node_page = await shallow<NodePageMain>(<NodePageMain history={history} />).instance();

    const setStateSpy = jest.spyOn(node_page, "setState");
    const queryAPI_nodeSpy = jest.spyOn(node_page, "queryAPI_node");
    const queryAPI_peersSpy = jest.spyOn(node_page, "queryAPI_peers");
    const getNodeInfoSpy = jest.spyOn(node_page, "getNodeInfo");

    await node_page.getNodeInfo();

    expect(setStateSpy).toHaveBeenCalledTimes(0);
    expect(queryAPI_nodeSpy).toHaveBeenCalledTimes(1);
    expect(queryAPI_peersSpy).toHaveBeenCalledTimes(1);
    expect(getNodeInfoSpy).toHaveBeenCalledTimes(1);
});

test('All components are present in DOM after render', async () => {

    // Mock all axios responses as reject
    axiosMock.get.mockRejectedValue(new Error("404 Not Found"));

    // Shallowly render the node page
    let history: History = createBrowserHistory();
    history.push('/node?public_key=' + mockNodeInfo.public_key);

    const node_page = await shallow<NodePageMain>(<NodePageMain history={history} />).instance();


});
