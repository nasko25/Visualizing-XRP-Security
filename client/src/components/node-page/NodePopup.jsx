import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { PartItem, DataSet, Network } from "vis-network";

export default class NodePopup extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.networkRef = React.createRef();
        this.createNetwork = this.createNetwork.bind(this);
    }

    createNetwork() {
        var nodes = [];
        var edges = [];
        nodes.push({
            id: 1,
            shape: "dot",
            color: {
                border: "white",
                background: "black"
            }
        });

        for (var i = 2; i <= this.props.node_info.peers.length + 1; i++) {
            nodes.push({
                id: i,
                shape: "dot",
                color: {
                    background: this.props.node_info.peers[i - 2].trust_score < 0.5 ? "red" : "green",
                    border: "white"
                }
            });
            edges.push({
                from: 1,
                to: i,
                width: 5,
                color: "white"
            })
        }

        const container = this.networkRef.current;
        const data = {
            nodes: nodes,
            edges: edges
        };
        const options = {
            physics: {
                enabled: false
            }
        };
        const network = new Network(container, data, options);
    }


    render() {
        return (
            <>
                <Modal size="lg" show={true} onHide={this.props.hideNode} centered animation={false}>
                    <Modal.Header>
                        <Modal.Title>{this.props.node_info.public_key}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div>
                            <div className="peer-network" ref={this.networkRef}/>
                            <div className="node-info">
                                <h1>Nice</h1>
                            </div>
                        </div>
                        <Button onClick={this.createNetwork}>Peers</Button>
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}
