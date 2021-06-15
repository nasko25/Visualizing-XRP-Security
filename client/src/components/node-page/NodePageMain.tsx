import React from "react";
import { Box, DataChart, Grid, Grommet, Header, Heading, List, Menu } from 'grommet';
import NodePeerGraph from "./NodePeerGraph";
import "./NodePage.css";
import { Port, Peer, NodePageState, NodePageProps, HistoricalScore, NodeInfoDB } from "./NodePageTypes";
import axios from 'axios';
import { humanizeUptime } from '../../helper';
import NavigationBar from "../NavigationBar";
import { COLORS, SETUP } from '../../style/constants';
import HistoricalChart from "../HistoricalChart";


/**
 * Component that visualizes information about a specific Node
 * It has a Header, including navigation button for returning to the main
 * page and a search bar, and a main body, consisting of a peer graph,
 * a statistical chart and an info box.
 * 
 */
class NodePageMain extends React.Component<NodePageProps, NodePageState> {
    
    constructor(props: NodePageProps) {
        super(props);

        this.state = {
            public_key: this.parseURL(),
            IP: "",
            peers: [],
            trust_score: 0,
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
    parsePorts(info: NodeInfoDB): Port[]{
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
            var peers: Peer[] = [];
            for (var i = 0; i < res.data.length; i++) {
                peers.push({ public_key: res.data[i].end_node, score: parseFloat(((Math.random() + 1) / 2).toFixed(3)) })
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
                var info: NodeInfoDB = res.data[0];

                var ports: Port[] = this.parsePorts(info);
                this.setState(
                    {
                        IP: info.IP,
                        rippled_version: info.rippled_version,
                        uptime: info.uptime,
                        ports: ports,
                    });
            }).catch(this.handleAPIError);
    }

    /**
     * Fetch all needed information from the server.
     * This method sends 2 requests - one for the basic
     * node information and one for the peers.
     */
    getNodeInfo() {
        var history: HistoricalScore[] = [];
        for (var i = 1; i <= 30; i++) {
            history.push({ date: i + "-08", score: parseFloat(((Math.random() + 1) / 2).toFixed(3)) });
        }
        this.setState({ historical_scores: history });
        this.queryAPI_node(this.state.public_key);
        this.queryAPI_peers(this.state.public_key);
    }

    preparePortList() {
        var ports = [];
        var thisPorts = this.state.ports;
        for (var i = 0; i < thisPorts.length; i++) {
            ports.push({ port_number: thisPorts[i].port_number, service: thisPorts[i].service });
        }
        if (ports.length === 0) {
            return "No information available"
        }
        return (<List
            style={{ width: "100%", height: "100%", alignSelf: "center" }}

            primaryKey="port_number"
            secondaryKey="service"

            data={ports}
        >

        </List>);
    }

    preparePortMenu() {

        return <Menu
            // icon={<More />}
            // hoverIndicator
            items={[{ label: 'one' }]}
            style={{ width: "10%" }}
        />

    }

    createNodeInformationList() {
        return <List
            style={{ width: "70%", height: "70%", alignSelf: "center" }}

            primaryKey="name"
            secondaryKey="value"

            data={[
                { name: 'Security score', value: this.state.trust_score },
                { name: 'IP', value: this.state.IP },
                { name: 'Rippled version', value: this.state.rippled_version },
                { name: 'Ports', value: this.preparePortList() },
                { name: 'Uptime', value: humanizeUptime(this.state.uptime) },
                { name: 'Peer count', value: this.state.peers.length },
            ]}
        />
    }

    createPeerList() {
        let list = <List
            style={{ alignSelf: "center", userSelect: 'none' }}
            primaryKey="public_key"
            secondaryKey="score"
            data={this.state.peers.sort((a, b) => {
                return b.score - a.score;
            })}
            border={{
                color: 'white',
                side: 'bottom'
            }}
            alignSelf="center"
            onClickItem={(peer: any) => {
                this.props.history.push("/node?public_key=" + peer.item.public_key);
            }}/>;
        return list;
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
                        <Box round="1%" margin={{ top: "2%", left: "1%", right: "2%", bottom: "1%" }} gridArea="peers_network" background={COLORS.main}>
                            <NodePeerGraph on_node_click={this.nodeOnClick} public_key={this.state.public_key} peers={this.state.peers}></NodePeerGraph>
                        </Box>
                        <Box round="1%" margin={{ top: "2%", left: "2%", right: "1%", bottom: "2%" }} gridArea="stats" background={COLORS.main}>
                            <Heading size="100%" margin="3%">{this.state.public_key}</Heading>
                            {this.createNodeInformationList()}
                            <Heading size="100%" margin="2%">Peer Information</Heading>
                            <Box
                                className="scrollbar-hidden"
                                overflow="auto"
                                style={{ height: "50%" }}
                                margin="2%"
                                round="1%"
                                background={COLORS.button}>
                                {this.createPeerList()}
                            </Box>
                        </Box>
                        {/* The historical scores chart */}
                        <Box round="1%" pad={{ left: "5%", right: "5%" }} justify="center" margin={{ top: "1%", left: "1%", right: "2%", bottom: "2%" }} gridArea="info" background={COLORS.main} color="hd_bgnd">
                            <Heading size="100%" margin="2%">Score over Time</Heading>
                            <HistoricalChart historical_scores={this.state.historical_scores}/>
                        </Box>
                    </Grid>
                </main>
            </Grommet>
        );
    }
}

export default NodePageMain;
