import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import { DataSet, DataSetEdges, DataSetNodes, Edge, Network, Node } from "vis-network/standalone";
import "./NodePage.css";
import { NodeInfo, Peer } from "./NodePageTypes";

/**
 * Component that visualizes the peer connections of a Node
 * Each peer is colored according to their trust score
 */

type NodePeerGraphProps = {
    node_info: NodeInfo,
    on_node_click: (public_key: string) => void
}

export default class NodePeerGraph extends Component<NodePeerGraphProps> {

    networkRef: React.RefObject<HTMLDivElement>;

    state = {
        node_info: {},
    }

    constructor(props: NodePeerGraphProps) {
        super(props);
        this.state.node_info = props.node_info;
        this.networkRef = React.createRef();
        this.createNetwork = this.createNetwork.bind(this);
    }

    componentDidMount(){
        this.createNetwork();
    }

    componentDidUpdate(){
        this.createNetwork();
    }
    
    /**
     * Creates the vis.js network
     * The only connections are from our Node to its peers
     */
    createNetwork() {
        var nodesArr: Node[] = [];
        var edgesArr: Edge[] = [];
        // Add network node for our Node
        nodesArr.push({
            id: 1,
            shape: "dot",
            size: 20,
            color: {
                border: "white",
                background: "black",
            },
            title: this.props.node_info.public_key
        });
        // Add network node and connection for each peer
        var node_info: any = this.props.node_info;

        for (var i = 2; i <= node_info.peers.length + 1; i++) {
            var curr: Peer = node_info.peers[i - 2];
            nodesArr.push({
                id: i,
                shape: "dot",
                size: 20,
                color: {
                    background:
                        curr.score < 0.5
                            ? "rgba(200, 0, 0, 0.7)"
                            : curr.score >= 0.95 ? "green" : "rgba(255," + 2 * parseFloat((1 - curr.score).toFixed(2)) * 255 + ", 0, 0.7)",
                    border: "white",
                },
                title: curr.public_key,
            });
            edgesArr.push({
                from: 1,
                to: i,
                width: 2,
                color: "rgba(255, 255, 255, 0.6)"
            });
        }

        var nodes: DataSetNodes = new DataSet(nodesArr);
        var edges: DataSetEdges = new DataSet(edgesArr);

        const container: any = this.networkRef.current;
        const data = {
            nodes: nodes,
            edges: edges,
        };
        const options = {
            physics: {
                hierarchicalRepulsion: {
                    nodeDistance: 140
                }
            },
            interaction: {
                hover: true
            }
        };
        var func = this.props.on_node_click;
        
        const network = new Network(container, data, options);
        network.on("click", function (properties) {
            var ids = properties.nodes;
            var clickedNodes: Object[] = nodes.get(ids);
        
            if (clickedNodes.length >= 1) {
                var n: Node = JSON.parse(JSON.stringify(clickedNodes[0]));
                var public_key: string = JSON.stringify(n.title).slice(1, -1);
                func(public_key);
            }
        });
    }

    render() {
        return (
            <>
                <div
                    className="peer-network"
                    style={{ width: "100%", height: "84%" }}
                    ref={this.networkRef} />
                <Button
                    style={{ width: "10%", height: "10%", alignSelf: "center", margin: "1%" }}
                    variant="dark"
                    onClick={this.createNetwork}>Peers</Button>
            </>
        );
    }
}
