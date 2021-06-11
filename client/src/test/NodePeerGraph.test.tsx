import NodePeerGraph, { NodePeerGraphProps } from '../components/node-page/NodePeerGraph';
import { createBrowserHistory, History } from 'history';
import { Peer, NodeInfoDB, PeerNodeDB } from '../components/node-page/NodePageTypes';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { fireEvent, getByTestId } from '@testing-library/dom';


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

const mockInfo: NodePeerGraphProps = {
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
    var button: HTMLButtonElement | null = null;
    
    if(container !== null){
      button = getByTestId(container, 'refresh-peers') as HTMLButtonElement;
    }
      
    if(button !== null){
      fireEvent.click(button);
    }
})