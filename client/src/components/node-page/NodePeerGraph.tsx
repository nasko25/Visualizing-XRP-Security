import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import { Network } from "vis-network/standalone";
import "./NodePage.css";
import { NodeInfo, Peer } from "./NodePageTypes";

/**
 * Component that visualizes the peer connections of a Node
 * Each peer is colored according to their trust score
 */

type NodePeerGraphProps = {
    node_info: NodeInfo,
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

    /**
     * Creates the vis.js network
     * The only connections are from our Node to its peers
     */
    createNetwork() {
        var nodes = [];
        var edges = [];
        // Add network node for our Node
        nodes.push({
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
            nodes.push({
                id: i,
                shape: "dot",
                size: 20,
                color: {
                    background:
                        curr.score < 0.5
                            ? "red"
                            : "rgb(" + 2 * parseFloat((1 - curr.score).toFixed(2)) * 255 + ", 255, 0)",
                    border: "white",
                },
                title: "Public key: " + curr.public_key + "\nScore: " + curr.score,
            });
            edges.push({
                from: 1,
                to: i,
                width: 2,
                color: "white",
            });
        }

        const container: any = this.networkRef.current;
        const data = {
            nodes: nodes,
            edges: edges,
        };
        const options = {
            physics: false,
            interaction: {
                hover: true
            },
            manipulation: {
                enabled: true
            }
        };
        const network = new Network(container, data, options);

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
