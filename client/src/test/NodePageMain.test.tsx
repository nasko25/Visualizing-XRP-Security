import NodePageMain from '../components/node-page/NodePageMain';
import axios from 'axios';
import '../components/node-page/NodePageTypes'
import { createBrowserHistory, History } from 'history';
import { NodeInfoDB, Peer, PeerNodeDB} from '../components/node-page/NodePageTypes';
import { mount, shallow } from 'enzyme';

//---------------SETUP AND CLEAN UP---------------//

// Mock axios
jest.mock("../components/node-page/NodePeerGraph");
jest.mock("axios");
const axiosMock = axios as jest.Mocked<typeof axios>;

// const initHistory: History = {
//     length: 4,
//     action: "PUSH",
//     location: {
//       pathname: "/node",
//       search: "?public_key=n9LzDoz7TYZfo8a1Mxvrz3m4R3kJY6Kux2m6svtXn697XuevACEE",
//       hash: "",
//       key: "vj2614"
//     }
    
//   }

test('Correct behavior on API info call success', () => {

    const mockNodeInfo: NodeInfoDB = {
        public_key: "bruh",
        IP: "bruh",
        latitude: 42,
        longtitude: 42,
        ports: [42],
        protocols: ["bruh"],
        rippled_version: '1.7.0',
        timestamp: "never",
        uptime: 42
    }

    axiosMock.get.mockResolvedValue(mockNodeInfo);
    const node_page = shallow<NodePageMain>(<NodePageMain history={createBrowserHistory()} />).instance();

    node_page.queryAPI_node("bruh");

    expect(node_page.state).toContain({ public_key: "bruh" });
});

test('Correct behavior on API peer call success', () => {

    const mockNodeInfo: PeerNodeDB[] = [{
        end_node: "bruh",
    }];

    axiosMock.get.mockResolvedValue(mockNodeInfo);
    const node_page = shallow<NodePageMain>(<NodePageMain history={createBrowserHistory()} />).instance();

    node_page.queryAPI_peers("bruh");

    expect(node_page.state.peers).toContain({ public_key: "bruh", score: 1});
});
