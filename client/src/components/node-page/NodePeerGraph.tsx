import { Component } from "react";
import Button from "react-bootstrap/Button";
import { DataSetEdges, DataSetNodes, Edge, Network, Node } from "vis-network";
import { DataSet } from 'vis-data';
import "./NodePage.css";
import { Box, Text } from 'grommet';
import { CircleInformation } from "grommet-icons";
import { Peer } from "./NodePageTypes";
import Loader from "../Loader";

/**
 * Component that visualizes the peer connections of a Node
 * Each peer is colored according to their trust score
 */

export type NodePeerGraphProps = {
    public_key: string,
    peers: Peer[],
    on_node_click: (public_key: string) => void,
}

export default class NodePeerGraph extends Component<NodePeerGraphProps> {

    network: Network | null = null;

    constructor(props: NodePeerGraphProps) {
        super(props);
        this.createNetwork = this.createNetwork.bind(this);
        this.hideLoad = this.hideLoad.bind(this);
        this.getColor = this.getColor.bind(this);
        this.onNodeClick = this.onNodeClick.bind(this);
    }

    componentDidUpdate(prevProps: NodePeerGraphProps, prevState: any) {
        if (this.props.public_key !== prevProps.public_key || this.props.peers !== prevProps.peers) {
            this.createNetwork();
        }
    }

    onNodeClick = (properties: any, nodes: DataSetNodes) => {
        var ids = properties.nodes;
        var clickedNodes: Object[] = nodes.get(ids);

        if (clickedNodes.length >= 1) {
            var n: Node = JSON.parse(JSON.stringify(clickedNodes[0]));
            var public_key: string = JSON.stringify(n.title).slice(1, -1);
            this.props.on_node_click(public_key);
        }
    }

    /**
     * Show the loading animation
     */
    showLoad() {
        document.getElementById("loader")?.classList.remove('hide-loader');
    }

    /**
     * Hide the loading animation
     */
    hideLoad() {
        document.getElementById("loader")?.classList.add('hide-loader');
    }

    componentWillUnmount() {
        if (this.network !== null) {
            this.network.destroy();
        }
    }

    /**
     * Determines the color of the node based on its score
     * @param score The node score
     * @returns The color
     */
    getColor(score: number): string {
        if (score > 100) {
            // Bad if it happens
            return 'blue';
        }
        if (score >= 90) {
            // Green
            return 'rgb(0, 255, 0)';
        }
        else if (score >= 80) {
            // Yellow
            return 'rgb(255, 255, 0)';
        } else if (score >= 70) {
            // Orange
            return 'rgb(255, 120, 0)';
        } else if (score >= 50) {
            // Red
            return 'rgb(255, 0, 0)';
        }
        else {
            // Dark Red
            return 'rgb(150, 0, 0)';
        }
    }

    /**
     * Creates the vis.js network
     * The only connections are from our Node to its peers
     */
    createNetwork() {
        if (this.network !== null) {
            this.network.destroy();
        }

        this.showLoad();

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

        // Sort peers ascending on score
        var peers: Peer[] = this.props.peers;
        peers.sort((a, b) => {
            return a.score - b.score;
        });

        // Add network node and connection for each peer
        // If there are too many to visualize, render only 150
        for (var i = 2; i <= Math.min(this.props.peers.length + 1, 150); i++) {
            var curr: Peer = this.props.peers[i - 2];
            nodesArr.push({
                id: i,
                shape: "dot",
                size: 20,
                color: {
                    background: this.getColor(curr.score),
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

        const container: any = document.getElementById('peer-network');
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

        const network = new Network(container, data, options);
        network.on("click", (properties) => {
            this.onNodeClick(properties, nodes);
        });

        network.once("stabilized", (params) => {
            this.hideLoad();
        });

        this.network = network;
    }

    /**
     * Creates an info button
     */
    info() {
        if(this.props.peers.length > 150) {
            return (<Box
                id='tooltip'
                style={{width: "30px", height: "30px", marginTop:"0.5%", marginLeft:"0.5%"}}
            >
                <CircleInformation color='red' size="30px"></CircleInformation>
                <span className='tooltipText'>There are too many peers! Showing 150 with lowest scores.<br></br><br></br>
                    The nodes are colored based on the score:<br></br>
                    - Green : 90 - 100<br></br>
                    - Yellow : 80 - 90<br></br>
                    - Orange : 70 - 80<br></br>
                    - Red : 50 - 70<br></br>
                    - Dark red : 0 - 50<br></br>
                    - Black : Current node
                </span>
            </Box>);
        }else {
            return (<Box
                id='tooltip'
                style={{width: "30px", height: "30px", marginTop:"0.5%", marginLeft:"0.5%"}}
            >
                <CircleInformation size="30px"></CircleInformation>  
                <span className='tooltipText'>
                    The nodes are colored based on the score as following:<br></br>
                    - Green : 90 - 100<br></br>
                    - Yellow : 80 - 90<br></br>
                    - Orange : 70 - 80<br></br>
                    - Red : 50 - 70<br></br>
                    - Dark red : 0 - 50<br></br>
                    - Black : Current node
                </span>
            </Box>);
        } 
        
    }

    render() {
        return (
            <div style={{ width: "100%", height: "100%", position: "relative" }}>

                {this.info()}

                <div className="peer-network"
                    style={{ width: "100%", height: "80%", position: "relative" }}
                    id='peer-network'
                    data-testid="peer-network" >
                </div>

                <Loader top={40} />

                <Button
                    style={{ width: "20%", height: "8%", alignSelf: "center", margin: "1%" }}
                    variant="dark"
                    onClick={this.createNetwork}
                    data-testid="refresh-peers"
                >Reshuffle Peers</Button>
            </div>
        );
    }
}
