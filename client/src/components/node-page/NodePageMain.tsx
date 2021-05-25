import React, { ChangeEvent, ReactPropTypes } from "react";
import { Box, DataChart, Grid, Grommet, Header, Heading, List, Text, TextInput } from 'grommet'
import Button from "react-bootstrap/Button";
import NodePeerGraph from "./NodePeerGraph";
import "./NodePage.css";
import { Peer, NodePageState, NodePageProps, HistoricalScore } from "./NodePageTypes";


/**
 * Component that visualizes information about a specific Node
 * It has a Header, including navigation button for returning to the main
 * page and a search bar, and a main body, consisting of a peer graph,
 * a statistical chart and an info box.
 * 
 */

var SETUP = {
    header_height: 7.5,
    hd_bgnd: '#C3C3C3',
}

var COLORS = {
    main: "#383838",
    button: "#212529;"
}

class NodePageMain extends React.Component<NodePageProps, NodePageState> {

    constructor(props: NodePageProps) {
        super(props);

        // The state
        this.state = {
            public_key: "",
            node_info: this.props.node_info ? this.props.node_info : {
                public_key: "",
                IP: "",
                peers: [],
                trust_score: 0,
                rippled_version: "",
                ports: [],
                history: []
            },
            speed: 3,
            displayButton: false,
            displayGreen: false
        }

        this.getNodeInfo = this.getNodeInfo.bind(this);
        this.onKeyPressSearch = this.onKeyPressSearch.bind(this);
        this.preparePortList = this.preparePortList.bind(this);
        this.createDataChart = this.createDataChart.bind(this);
        this.nodeOnClick = this.nodeOnClick.bind(this);
    }

    componentDidMount() {
        this.getNodeInfo();
    }

    // Just for testing
    // Should actually send a request to server if props is empty
    getNodeInfo() {
        var peers: Peer[] = [];
        var history: HistoricalScore[] = [];
        for (var i = 0; i < 40; i++) {
            peers.push({ public_key: Math.random().toString(36).substring(7), score: parseFloat(Math.random().toFixed(3)) });
        }
        for (var i = 1; i <= 30; i++) {
            history.push({ date: "2020-08-" + i, score: parseFloat(Math.random().toFixed(3)) });
        }
        peers.sort((a: Peer, b: Peer) => {
            return (b.score - a.score);
        });
        var info = {
            public_key: "n9MozjnGB3tpULewtTsVtuudg5JqYFyV3QFdAtVLzJaxHcBaxuXD",
            IP: "34.221.161.114",
            peers: peers,
            trust_score: 1,
            ports: [{ port_number: 22, service: "SSH", version: "12.3" },
            { port_number: 80, service: "HTTP", version: "N/a" }],
            rippled_version: "1.7.0",
            history: history
        };

        this.setState({ public_key: "n9MozjnGB3tpULewtTsVtuudg5JqYFyV3QFdAtVLzJaxHcBaxuXD", node_info: info });
        return info;
    }

    createDataChart() {
        return (
            <DataChart
                data={this.state.node_info.history}
                series={['date', { property: 'score' }]}
                chart={[
                    { property: 'score', type: 'line', opacity: 'medium', thickness: '5%' },
                    { property: 'score', type: 'point', point: 'diamond', thickness: '10%' }
                ]}
                guide={{ x: { granularity: 'fine' }, y: { granularity: 'fine' } }}
                size={{ width: "fill" }}
                axis={{ x: { granularity: "medium" }, y: { granularity: "fine" } }}
                legend
                detail
            />
        );
    };

    // Event Handler for the Search Bar
    onKeyPressSearch(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.code === "Enter") alert("Search Triggered! Key entered is: " + e.currentTarget.value);
        this.setState({ displayGreen: !this.state.displayGreen });
        // TODO send request to check for the key
        // If key exists and information is obtained, render a green button to lead to the page
        // If not, render a red box with message
    }

    preparePortList() {
        var ports: string = "";
        var thisPorts = this.state.node_info.ports;
        for (var i = 0; i < thisPorts.length; i++) {
            ports = ports.concat("Port: " + thisPorts[i].port_number + " Service: " + thisPorts[i].service + "\n");
        }
        return ports;
    }

    createNodeInformationList() {
        return <List
            style={{ width: "70%", height: "70%", alignSelf: "center" }}

            primaryKey="name"
            secondaryKey="value"

            data={[
                { name: 'Security score', value: this.state.node_info.trust_score },
                { name: 'IP', value: this.state.node_info.IP },
                { name: 'rippled_version', value: this.state.node_info.rippled_version },
                { name: 'ports', value: this.preparePortList() },
            ]}
        />
    }

    createPeerList() {
        return <List
            style={{ width: "70%", alignSelf: "center" }}
            primaryKey="public_key"
            secondaryKey="score"
            data={this.state.node_info.peers}
            border={false}
        />
    }

    nodeOnClick(public_key: string) {
        this.setState({ public_key: public_key });
        this.getNodeInfo();
    }

    render() {
        return (
            <Grommet
                style={{ width: "100%", height: "100%" }}
                theme={{ global: { colors: { hd_bgnd: SETUP.hd_bgnd, t: "#000000" } } }} >

                <Header background={COLORS.main} style={{ width: "100%", height: `${SETUP.header_height}%` }} >
                    <Grid
                        style={{ width: "100%", height: "100%" }}
                        rows={["1"]}
                        columns={["1/4", "1/4", "1/2"]}
                        areas={[
                            { name: 'heading', start: [0, 0], end: [0, 0] },
                            { name: 'button_return', start: [1, 0], end: [1, 0] },
                            { name: 'search', start: [2, 0], end: [2, 0] },
                        ]}>

                        {/* The heading. */}
                        <Heading margin="2%" gridArea="heading" alignSelf="center" size="small">Node Page</Heading>

                        {/* The Button for returning to the main page. */}
                        <Box
                            height="80%"
                            gridArea="button_return"
                            justify="center"
                            alignSelf="center"
                            margin="2%">
                            <Button 
                                variant="dark" 
                                // onClick={() => this.setState({ displayButton: true })}
                                style={{ width: "80%", height: "80%", alignSelf: "center" }} >
                                <Text contentEditable="false" size="large" weight="bold">Back To Homepage</Text>
                            </Button>
                        </Box>

                        {/* The Search Bar */}
                        <Box gridArea="search"
                            alignSelf="center"
                            direction="row"
                            justify="center"
                            background={COLORS.button}
                            margin="2%">
                            <TextInput 
                                onKeyPress={this.onKeyPressSearch}
                                textAlign="center"
                                placeholder="Search Public Key"
                                />
                            {/* {this.state.displayButton === false ? null : this.state.displayGreen === false ?
                                <Button style={{ width: "10%", alignSelf: "center", background: "green", borderRadius: "10%", fontWeight: "bold" }} color="black" >Continue</Button>
                                :
                                <Button style={{ width: "10%", alignSelf: "center", background: "red", borderRadius: "10%", fontWeight: "bold" }} color="black" >Wrong Key</Button>
                            } */}
                        </Box>
                    </Grid>
                </Header>

                <main style={{ width: "100%", height: `${100 - SETUP.header_height}%` }}>
                    <Grid
                        style={{ width: "100%", height: "100%" }}
                        rows={["1/2", "1/2"]}
                        columns={["1/2", "1/2"]}
                        areas={[
                            { name: 'map', start: [1, 0], end: [1, 0] },
                            { name: 'stats', start: [0, 0], end: [0, 1] },
                            { name: 'info', start: [1, 1], end: [1, 1] },
                        ]}>
                        <Box round="5%" margin="2%" gridArea="map" background={COLORS.main}>
                            <NodePeerGraph on_node_click={this.nodeOnClick} node_info={this.state.node_info}></NodePeerGraph>
                        </Box>
                        <Box round="5%" margin="2%" gridArea="stats" background={COLORS.main}>
                            <Heading size="100%" margin="3%">{this.state.public_key}</Heading>
                            {this.createNodeInformationList()}
                            <Heading size="100%" margin="2%">Peer Information</Heading>
                            <Box 
                                className="scrollbar-hidden"
                                overflow="auto" 
                                style={{ height: "40%" }} 
                                margin="2%" 
                                round="20px" 
                                background={COLORS.button}>
                                {this.createPeerList()}
                            </Box>
                        </Box>
                        <Box pad={{ left: "5%", right: "5%" }} justify="center" round="5%" margin="2%" gridArea="info" background={COLORS.main} color="hd_bgnd">
                            {/* <Box margin="20px" alignSelf="center" width="200px" height="200px">
                                <img width="100%" style={{ animation: `spin ${this.state.speed}s linear infinite` }} src={"https://i.pinimg.com/originals/e6/9d/92/e69d92c8f36c37c84ecf8104e1fc386d.png"} alt="img" />
                            </Box> */}
                            <Heading size="100%" margin="2%">Score over Time</Heading>
                            {this.createDataChart()}
                        </Box>
                    </Grid>
                </main>
            </Grommet>
        );
    }
}

export default NodePageMain;
