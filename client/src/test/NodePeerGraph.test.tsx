import NodePeerGraph from '../components/node-page/NodePeerGraph';
import { createBrowserHistory, History } from 'history';
import { Peer, NodeInfoDB, PeerNodeDB } from '../components/node-page/NodePageTypes';
import { shallow, mount } from 'enzyme';
import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";


let container: HTMLElement | null = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  if(container !== null){
    unmountComponentAtNode(container);
    container.remove();
  }
  container = null;
});

afterEach(() => {
    jest.clearAllMocks();
});

const mockInfo = {
    public_key: '',
    peers: [],
    on_node_click: () => console.log('')
}

test('render in dom', async () => {
    act(() => {
        render(<NodePeerGraph
            public_key={mockInfo.public_key}
            peers={mockInfo.peers}
            on_node_click={mockInfo.on_node_click}/>, container);
    });
})

test('shallow render', async () => {
    const peer_graph = await shallow<NodePeerGraph>(<NodePeerGraph 
        public_key={mockInfo.public_key}
        peers={mockInfo.peers}
        on_node_click={mockInfo.on_node_click}/>)
        .instance();

    const createNetworkSpy = jest.spyOn(peer_graph, "createNetwork");

    peer_graph.createNetwork();

    expect(createNetworkSpy).toHaveBeenCalled();
})