import NodePeerGraph from '../components/node-page/NodePeerGraph';
import { createBrowserHistory, History } from 'history';
import { Peer, NodeInfoDB, PeerNodeDB } from '../components/node-page/NodePageTypes';
import { shallow, mount } from 'enzyme';

afterEach(() => {
    jest.clearAllMocks();
});

const mockInfo = {
    public_key: '',
    peers: [],
    on_node_click: () => console.log('')
}

test('shallow render', async () => {
    const peer_graph = await mount<NodePeerGraph>(<NodePeerGraph 
        public_key={mockInfo.public_key}
        peers={mockInfo.peers}
        on_node_click={mockInfo.on_node_click}/>)
        .instance();

    const createNetworkSpy = jest.spyOn(peer_graph, "createNetwork");

    expect(createNetworkSpy).toHaveBeenCalled();
})