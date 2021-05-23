import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import { Network } from "vis-network";

/**
 * Componenta that visualizes the peer connections of a Node
 * Each peer is colored according to their trust score
 */

type NodePeerGraphProps = {
    node_info: object,

}

export default class NodePeerGraph extends Component<NodePeerGraphProps> {

    networkRef: React.RefObject<HTMLDivElement>;

    state = {
        node_info: {},
    }

    constructor(props : NodePeerGraphProps) {
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
            size: 15,
            color: {
                border: "white",
                background: "black",
            },
        });

        // Add network node and connection for each peer
        var node_info: any = this.state.node_info;

        for (var i = 2; i <= node_info.peers.length + 1; i++) {
            nodes.push({
                id: i,
                shape: "dot",
                size: 15,
                color: {
                    background:
                        node_info.peers[i - 2].trust_score < 0.5
                            ? "red"
                            : "green",
                    border: "white",
                },
            });
            edges.push({
                from: 1,
                to: i,
                width: 5,
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
            // configure: {
            //     enabled: true,
            //     showButton: true
            // }
        };
        const network = new Network(container, data, options);
    }

    render() {
        return (
            <>
                <div
                    className="peer-network"
                    style={{ width: "100%", height: "90%" }}
                    ref={this.networkRef} />
                <Button
                    style={{ width: "10%", height: "10%", alignSelf: "center" }}
                    onClick={this.createNetwork}>Peers</Button>
            </>
        );
    }
}
