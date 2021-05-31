import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import { DataSet, DataSetEdges, DataSetNodes, Edge, Network, Node } from "vis-network/standalone";
import "./NodePage.css";
import { NodeInfo, Peer } from "./NodePageTypes";
import { History } from 'history';

/**
 * Component that visualizes the peer connections of a Node
 * Each peer is colored according to their trust score
 */

type NodePeerGraphProps = {
    public_key: string,
    peers: Peer[],
    on_node_click: (public_key: string) => void,
    history: History
}

export default class NodePeerGraph extends Component<NodePeerGraphProps> {

    networkRef: React.RefObject<HTMLDivElement>;
    network: Network | null = null;

    constructor(props: NodePeerGraphProps) {
        super(props);
        this.networkRef = React.createRef();
        this.createNetwork = this.createNetwork.bind(this);
    }

    componentDidUpdate() {
        this.createNetwork();
    }

    componentWillUnmount(){
        if(this.network !== null){
            this.network.destroy();
        }
    }

    /**
     * Creates the vis.js network
     * The only connections are from our Node to its peers
     */
    createNetwork() {
        if(this.network !== null){
            this.network.destroy();
        }
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
            title: this.props.public_key
        });
        // Add network node and connection for each peer

        for (var i = 2; i <= this.props.peers.length + 1; i++) {
            var curr: Peer = this.props.peers[i - 2];
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
                    nodeDistance: 1
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
        this.network = network;
    }

    render() {
        return (
            <>
                <div
                    className="peer-network"
                    style={{ width: "100%", height: "84%" }}
                    ref={this.networkRef} />
                <Button
                    style={{ width: "20%", height: "10%", alignSelf: "center", margin: "1%" }}
                    variant="dark"
                    onClick={this.createNetwork}>Reshuffle Peers</Button>
            </>
        );
    }
}
