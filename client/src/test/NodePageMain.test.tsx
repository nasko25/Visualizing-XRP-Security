import NodePageMain from '../components/node-page/NodePageMain';
import axios from 'axios';
import '../components/node-page/NodePageTypes'
import { createBrowserHistory, History } from 'history';
import { Peer, NodeInfoDB, PeerNodeDB } from '../components/node-page/NodePageTypes';
import { shallow } from 'enzyme';
import { List } from 'grommet';

//---------------SETUP AND CLEAN UP---------------//

// Mock the peer graph
jest.mock("../components/node-page/NodePeerGraph");

// Mock axios
jest.mock("axios");
const axiosMock = axios as jest.Mocked<typeof axios>;

const mockNodeInfo: NodeInfoDB = {
    public_key: "n9KFUrM9FmjpnjfRbZkkYTnqHHvp2b4u1Gqts5EscbSQS2Fpgz16",
    IP: "bruh",
    latitude: 42,
    longtitude: 42,
    ports: [42],
    protocols: ["HTTP"],
    rippled_version: '1.6.0',
    timestamp: "never",
    uptime: 42
};

const mockData = {
    data: [mockNodeInfo]
}
/**
 * TODO
 * Once we update the API these should also contain a score
 */
const mockNodePeers: PeerNodeDB[] = [
    { end_node: "n9MGChK9EgiCBM6s15EwF9d6m4LWZHh1UnJcgr16kQr4xBpx71fS" },
    { end_node: "n9Jy88tMgEhHocG9hZssgsYRmTz9CjCgjp3DiqzSgYqrp4BxTE11" },
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

    const node_page = shallow<NodePageMain>(<NodePageMain history={history} />).instance();

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
    expect(node_page.state.IP).toEqual(mockNodeInfo.IP);
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

    const node_page = shallow<NodePageMain>(<NodePageMain history={history} />).instance();

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
test('Correct behaviour on API peer info call success', async () => {

    axiosMock.get.mockResolvedValue(mockPeersData);
    let history: History = createBrowserHistory();
    history.push('/node?public_key=' + mockNodeInfo.public_key);
    const node_page = shallow<NodePageMain>(<NodePageMain history={history} />).instance();

    await node_page.queryAPI_peers("");
    
    expect(node_page.state.peers).toContain({ public_key: mockNodePeers[0].end_node, score: 1 });
    expect(node_page.state.peers).toHaveLength(2);
});

test('Create peer list returns correct List element with 0 peers', () => {

    let history: History = createBrowserHistory();
    history.push('/node?public_key=' + mockNodeInfo.public_key);
    const node_page = shallow<NodePageMain>(<NodePageMain history={history} />).instance();

    const list = node_page.createPeerList();

    expect(list.props.data).toHaveLength(0);
});

test('Create peer list returns correct List element with multiple peers', () => {

    let history: History = createBrowserHistory();
    history.push('/node?public_key=' + mockNodeInfo.public_key);
    const node_page = shallow<NodePageMain>(<NodePageMain history={history} />).instance();
    
    let peers: Peer[] = mockNodePeers.map((p) => {
         return {public_key: p.end_node, score: 1}
        }
    );

    node_page.setState({ peers: peers});
    const list = node_page.createPeerList();

    expect(list.props.data).toHaveLength(peers.length);
    expect(list.props.data).toContain(peers[0]);
    expect(list.props.data).toContain(peers[1]);
});
