import React from "react";
import { Box, DataTable, Grid, Grommet, Header, Heading, List } from 'grommet';
import NodePeerGraph from "./NodePeerGraph";
import "./NodePage.css";
import { Port, Peer, NodePageState, NodePageProps, NodeInfoDB, PeerNodeDB } from "./NodePageTypes";
import axios from 'axios';
import { humanizeUptime } from '../../helper';
import NavigationBar from "../NavigationBar";
import { COLORS, SETUP } from '../../style/constants';
import HistoricalChart from "../HistoricalChart";


/**
 * Component that visualizes information about a specific Node
 * It has a Header with a search bar, and a main body, consisting of a peer graph,
 * a statistical chart and an info box.
 */
class NodePageMain extends React.Component<NodePageProps, NodePageState> {

    constructor(props: NodePageProps) {
        super(props);

        this.state = {
            public_key: this.parseURL(),
            IP: "",
            peers: [],
            security_score: 0,
            rippled_version: "",
            ports: [],
            historical_scores: [],
            uptime: 0
        }

        /**
         * Binding the class methods to the 'this' keyword for the class
         */
        this.getNodeInfo = this.getNodeInfo.bind(this);
        this.preparePortList = this.preparePortList.bind(this);
        this.nodeOnClick = this.nodeOnClick.bind(this);
        this.queryAPI_peers = this.queryAPI_peers.bind(this);
        this.queryAPI_node = this.queryAPI_node.bind(this);
        this.parseURL = this.parseURL.bind(this);
        this.historyListener = this.historyListener.bind(this);
        this.handleAPIError = this.handleAPIError.bind(this);
        this.createPeerTable = this.createPeerTable.bind(this);
        this.historyListener();
    }

    /**
     * Fetch all the needed information  from the server,
     * once the component has mounted.
     */
    componentDidMount() {
        this.getNodeInfo();
    }

    /**
     * Everytime we change the public_key in the state, 
     * we should make a request for information from the server
     * The method is automatically invoked by React,
     * so we don't need to call it manually
     * @param prevProps The previous props
     * @param prevState The previous state
     * @param some any
     */
    componentDidUpdate(prevProps: NodePageProps, prevState: NodePageState, some: any) {
        if (prevState.public_key !== this.state.public_key) {
            this.getNodeInfo();
        }
    }

    /**
     * A listener for changes in the history
     * 
     * Every time we update the history by navigating forwards or backwards,
     * we update the public_key with the one from the URL request parameter.
     */
    historyListener() {
        this.props.history.listen((location) => {
            let public_key_from_url = location.search.split("?public_key=")[1];
            if (this.state.public_key !== public_key_from_url) {
                this.setState({ public_key: public_key_from_url });
            }
        });
    }

    /**
     * Get the public_key from the URL request parameter
     * @returns The public_key
     */
    parseURL(): string {
        return this.props.history.location.search.split("?public_key=")[1];
    }

    /**
     * Pass this function to the catch block of the Promise returned from 
     * axios.get; It should handle the different possible errors accordingly
     * @param error The error 
     */
    handleAPIError(error: any): void {
        if (error.response) {
            // error in the response
            console.log(`Received an error response:`);
            console.log(error.response);
        } else if (error.request) {
            // client never received a response, or request never left
            console.log(`Server did not respond: `);
            console.log(error.request);
        } else {
            // anything else
            console.log(error.message);
        }
    }

    /**
     * Parses the port information from the NodeInfo query
     * @param info The data of the response
     * @returns The port list, in the format as in this.props
     */
    parsePorts(info: NodeInfoDB): Port[] {
        var ports: Port[] = [];
        if (info.ports !== null && info.protocols !== null && info.ports !== "''" && info.protocols !== "''") {
            var infoPorts: string[] = info.ports.split(',');
            var infoProtocols: string[] = info.protocols.split(',');
            if (info.ports) {
                infoPorts.forEach((port, i) => {
                    ports.push({ port_number: parseInt(port), service: infoProtocols[i], version: "Not Implemented yet" })
                });
            }
        }
        return ports;
    }

    /**
     * Fetch information for the node's peers from the server
     * @param public_key The public_key of the node
     * @returns 
     */
    queryAPI_peers(public_key: string): Promise<void> {
        return axios.get("http://" + window.location.hostname + ":8080/node/peers?public_key=" + public_key).then((res) => {
            let peers: Peer[] = [];
            let dbPeers: PeerNodeDB[] = res.data;
            for (var i = 0; i < dbPeers.length; i++) {
                peers.push({ public_key: dbPeers[i].public_key, score: dbPeers[i].score, timestamp: dbPeers[i].timestamp})
            }
            this.setState({ peers: peers });
        }).catch(this.handleAPIError);
    }

    /**
     * Fetch information for the node's general information from the server
     * @param public_key The public_key of the node
     * @returns 
     */
    queryAPI_node(public_key: string) {
        return axios.get("http://" + window.location.hostname + ":8080/node/info?public_key=" + public_key)
            .then((res) => {
                if (res.data.length === 0) {
                    return;
                }
                console.log(res);
                var info: NodeInfoDB = res.data[0];

                var ports: Port[] = this.parsePorts(info);
                this.setState(
                    {
                        security_score: info.score,
                        IP: info.ip,
                        rippled_version: info.rippled_version,
                        uptime: info.uptime,
                        ports: ports,
                        historical_scores: info.history.map((s) => {
                            return {
                                score: parseFloat(s.average_score.toFixed(2)), 
                                date: String(s.date).slice(0, 10),
                            }
                        })
                    });
            }).catch(this.handleAPIError);
    }

    /**
     * Fetch all needed information from the server.
     * This method sends 2 requests - one for the basic
     * node information and one for the peers.
     */
    getNodeInfo() {
        this.queryAPI_node(this.state.public_key);
        this.queryAPI_peers(this.state.public_key);
    }

    /**
     * @returns The ports and their services as a List in a Box
     */
    preparePortList() {
        var ports = [];
        var thisPorts = this.state.ports;
        for (var i = 0; i < thisPorts.length; i++) {
            ports.push({ port_number: thisPorts[i].port_number, service: thisPorts[i].service });
        }
        if (ports.length === 0) {
            return "No information available"
        }
        return (
            <Box overflow='auto' style={{ width: "100%", height: "10%" }}>
                <List
                    style={{ width: "100%", height: "100%", alignSelf: "center" }}
                    primaryKey="port_number"
                    secondaryKey="service"
                    data={ports}
                >
                </List>
            </Box>);
    }

    /**
     * @returns A List of all the properties to be displayed in the Node Information section
     */
    createNodeInformationList() {
        return (
            <Box overflow='auto' style={{height: "45%"}}>
                <List
                    style={{ width: "70%", height: "70%", alignSelf: "center" }}

                    primaryKey="name"
                    secondaryKey="value"

                    data={[
                        { name: 'Security score', value: this.state.security_score },
                        { name: 'IP', value: this.state.IP },
                        { name: 'Rippled version', value: this.state.rippled_version },
                        { name: 'Uptime', value: humanizeUptime(this.state.uptime) },
                        { name: 'Peer count', value: this.state.peers.length },
                        { name: 'Ports', value: this.preparePortList() },
                    ]}
                />
            </Box >);
    }

    /**
     * @returns A DataTable, containing the information about the node's peers and their scores
     */
    createPeerTable() {
        let dt = 
        <DataTable
            columns={[
                {
                    property: "idx",
                    header: <b></b>,
                },
                {
                    property: "public_key",
                    header: <b>Public Key</b>,
                },
                {
                    property: "timestamp",
                    header: <b>Timestamp</b>,
                },
                {
                    property: "score",
                    header: <b>Score</b>,
                }
            ]}
            data={this.state.peers.sort((a, b) => {
                    return b.score - a.score;
                }).map((peer, idx) => {
                    return {
                        public_key: peer.public_key,
                        score: parseFloat(peer.score.toFixed(1)),
                        idx: idx + 1,
                        timestamp: String(peer.timestamp).slice(0, 10)
                    }
                })
            }
            onClickRow={({datum}) => {
                this.props.history.push("/node?public_key=" + datum.public_key);
            }}>
        </DataTable>

        return dt;
    }

    /**
     * A callback we pass to the NodePageGraph component
     * that handles what happens when a node on it is clicked
     * @param public_key 
     */
    nodeOnClick(public_key: string) {
        this.props.history.push("/node?public_key=" + public_key);
    }

    render() {
        return (
            <Grommet
                style={{ width: "100%", height: "100%" }}>

                <Header background={COLORS.nav} style={{ width: "100%", height: `${SETUP.header_height}%` }} >
                    <NavigationBar title={'Node Page'}></NavigationBar>
                </Header>
                {/* We split the main part of the application in a 2x2 grid with 3 components,
                    the one on the left show information about the node and its peers, the top
                    right one is the peer network graph and the bottm right one is the history
                    graph. */}
                <main style={{ width: "100%", height: `${100 - SETUP.header_height}%` }}>
                    <Grid
                        fill
                        style={{ width: "100%", height: "100%" }}
                        rows={["60%", "40%"]}
                        columns={["50%", "50%"]}
                        areas={[
                            { name: 'peers_network', start: [1, 0], end: [1, 0] },
                            { name: 'stats', start: [0, 0], end: [0, 1] },
                            { name: 'info', start: [1, 1], end: [1, 1] },
                        ]}>
                        <Box round="1%" margin={{ top: "2%", left: "1%", right: "2%", bottom: "1%" }} gridArea="peers_network" background={COLORS.main} overflow='hidden'>
                            <NodePeerGraph on_node_click={this.nodeOnClick} public_key={this.state.public_key} peers={this.state.peers}></NodePeerGraph>
                        </Box>
                        <Box round="1%" margin={{ top: "2%", left: "2%", right: "1%", bottom: "2%" }} gridArea="stats" background={COLORS.main} overflow='auto'>
                            <Heading size="100%" margin="2%">{this.state.public_key}</Heading>
                            {this.createNodeInformationList()}
                            <Heading size="100%" margin="1%">Peer Information</Heading>
                            <Box
                                overflow="auto"
                                style={{ height: "45%" }}
                                margin="1%"
                                round="1%"
                                background={COLORS.button}>
                                {this.createPeerTable()}
                            </Box>
                        </Box>
                        {/* The historical scores chart */}
                        <Box round="1%" pad={{ left: "5%", right: "5%" }} justify="center" margin={{ top: "1%", left: "1%", right: "2%", bottom: "2%" }} gridArea="info" background={COLORS.main} color="hd_bgnd" overflow='auto'>
                            <Heading size="100%">Score over Time</Heading>
                            <HistoricalChart historical_scores={this.state.historical_scores} />
                        </Box>
                    </Grid>
                </main>
            </Grommet>
        );
    }
}

export default NodePageMain;
