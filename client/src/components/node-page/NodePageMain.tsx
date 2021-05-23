import React, { ChangeEvent, ReactPropTypes } from "react";
import { Box, Grid, Grommet, Header, Heading, InfiniteScroll, KeyPress, List, Main, Menu, Nav, Tab, Table, TableBody, TableCell, TableHeader, TableRow, Text, TextInput } from 'grommet'
import Button from "react-bootstrap/Button";
import NodePeerGraph from "./NodePeerGraph";
import "./NodePage.css";


/**
 * Component that visualizes information about a specific Node
 * It has a Header, including navigation button for returning to the main
 * page and a search bar, and a main body, consisting of a peer graph,
 * a statistical chart and an info box.
 * 
 */


// The properties that should be passed in JSX to this component
type NodePageProps = {
    node_info: NodeInfo,
    key: string
}

// How the state should look like
type NodePageState = {
    key: string,
    node_info: NodeInfo,
    speed: number,
    displayButton: boolean,
    displayGreen: boolean
}

type NodeInfo = {
    public_key: string,
    peers: Peer[],
    trust_score: number,
    IP: string,
    rippled_version: string,
    ports: Port[]
}

type Port = {
    port_number: number,
    service: string
}

type Peer = {
    public_key: string,
    score: number
}

var SETUP = {
    header_height: 10,
    hd_bgnd: '#C3C3C3',
}

var COLORS = {
    main: "#383838",
    button: "#"
}

class NodePageMain extends React.Component<NodePageProps, NodePageState> {


    constructor(props: NodePageProps) {
        super(props);

        // The state
        this.state = {
            key: "",
            node_info: this.props.node_info ? this.props.node_info : {
                public_key: "",
                IP: "",
                peers: [],
                trust_score: 0,
                rippled_version: "",
                ports: []
            },
            speed: 3,
            displayButton: false,
            displayGreen: false
        }

        // this.state.key = props.key;

        this.getNodeInfo = this.getNodeInfo.bind(this);
        this.onKeyPressSearch = this.onKeyPressSearch.bind(this);
    }

    // Just for testing
    // Should actually send a request to server if props is empty
    getNodeInfo() {
        var peers = [];
        for (var i = 0; i < 50; i++) {
            peers.push({ public_key: Math.random().toString(36).substring(7), score: Math.random() });
        }
        var info = {
            public_key: "n9MozjnGB3tpULewtTsVtuudg5JqYFyV3QFdAtVLzJaxHcBaxuXD",
            IP: "34.221.161.114",
            peers: peers,
            trust_score: 1,
            ports: [{port_number: 22, service: "SSH"}],
            rippled_version: "1.7.0"
        };
        if(this.state.node_info){
            if(this.state.node_info.public_key === ""){
                this.setState({ node_info: info }, () => {
                    console.log("nice");
                });
            }
        }
        
        return info;
    }

    // Event Handler for the Search Bar
    onKeyPressSearch(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.code === "Enter") alert("Search Triggered! Key entered is: " + e.currentTarget.value);
        this.setState({displayGreen: !this.state.displayGreen});
        // TODO send request to check for the key
        // If key exists and information is obtained, render a green button to lead to the page
        // If not, render a red box with message
    }

    render() {
        this.getNodeInfo();
        return (
            <Grommet
                style={{ width: "100%", height: "100%" }}
                theme={{ global: { colors: { hd_bgnd: SETUP.hd_bgnd, t: "#000000" } } }} >

                <Header background="hd_bgnd" style={{ width: "100%", height: `${SETUP.header_height}%` }} >
                    <Grid
                        style={{ width: "100%", height: "100%" }}
                        rows={["100%"]}
                        gap="medium"
                        columns={["1/5", "2/5", "2/5"]}
                        areas={[
                            { name: 'heading', start: [0, 0], end: [0, 0] },
                            { name: 'button_return', start: [1, 0], end: [1, 0] },
                            { name: 'search', start: [2, 0], end: [2, 0] },
                        ]}>

                        {/* The Heading for the Page */}
                        <Box
                            gridArea="heading"
                            alignSelf="center" >
                            <Heading size="3xl" color="t">Node Page</Heading>
                        </Box>

                        {/* The Button for returning to the main page. */}
                        <Box
                            round="10%"
                            height="80%"
                            gridArea="button_return"
                            justify="center"
                            alignSelf="center"
                        // background="#909090"
                        >
                            <Button onClick= {() => this.setState({displayButton: true})} style={{ width: "80%", height: "80%", alignSelf: "center", background: "red" }} >
                                <Text contentEditable="false" color={COLORS.main} size="large" weight="bold">Back To Homepage</Text>
                            </Button>
                        </Box>

                        {/* The Search Bar */}
                        <Box gridArea="search"
                            alignSelf="center"
                            direction="row"
                            justify="center"
                            gap="small"
                            margin="10px">
                            <Text alignSelf="center" weight="bold">Search</Text>
                            <TextInput size="small" onKeyPress={this.onKeyPressSearch} />
                            {this.state.displayButton === false ? null : this.state.displayGreen === false ?
                                <Button style={{ alignSelf: "center", background: "green", borderRadius: "10%", fontWeight: "bold" }} color="black" >Continue</Button>
                                :
                                <Button style={{ alignSelf: "center", background: "red", borderRadius: "10%", fontWeight: "bold" }} color="black" >Wrong Key</Button>
                            }
                        </Box>
                    </Grid>
                </Header>

                <main style={{ width: "100%", height: `${100 - SETUP.header_height}%` }}>
                    <Grid
                        style={{ width: "100%", height: "100%" }}
                        rows={["1/2", "1/2"]}
                        columns={["1/2", "1/2"]}
                        areas={[
                            { name: 'map', start: [0, 0], end: [0, 0] },
                            { name: 'stats', start: [1, 0], end: [1, 1] },
                            { name: 'info', start: [0, 1], end: [0, 1] },
                        ]}>
                        <Box round="5%" margin="2%" gridArea="map" background={COLORS.main}>
                            {/* <NodePeerGraph node_info={this.state.node_info === {} ? this.getNodeInfo() : this.state.node_info}></NodePeerGraph> */}
                            <NodePeerGraph node_info={this.state.node_info}></NodePeerGraph>
                        </Box>
                        <Box round="5%" margin="2%" gridArea="stats" background={COLORS.main}>
                            {/* <Heading size="100%" margin="2%">Node Information</Heading> */}
                            <Heading size="100%" margin="3%">{this.state.node_info.public_key}</Heading>
                            <List
                                style={{ width: "70%", height: "70%", alignSelf: "center" }}

                                primaryKey="name"
                                secondaryKey="value"

                                data={[
                                    { name: 'Security score', value: this.state.node_info.trust_score },
                                    { name: 'IP', value: this.state.node_info.IP },
                                    { name: 'rippled_version', value: this.state.node_info.rippled_version },
                                    { name: 'ports', value: this.state.node_info.ports.toString },
                                ]}
                            />
                            <Heading size="100%" margin="2%">Peer Information</Heading>
                            <Box className="scrollbar-hidden" overflow="auto" style={{ height: "30%" }} margin="2%" round="20px" border={{ color: "hd_bgnd" }} background="rgb(70, 70, 38)">
                                <List
                                    style={{ width: "70%", alignSelf: "center" }}

                                    primaryKey="public_key"
                                    secondaryKey="score"

                                    data={this.state.node_info.peers}
                                />
                            </Box>
                        </Box>
                        <Box round="5%" margin="2%" gridArea="info" background={COLORS.main} color="hd_bgnd">
                            <Text size="xlarge">Info</Text>
                            <Box margin="20px" alignSelf="center" width="200px" height="200px">
                                <img width="100%" style={{ animation: `spin ${this.state.speed}s linear infinite` }} src={"https://i.pinimg.com/originals/e6/9d/92/e69d92c8f36c37c84ecf8104e1fc386d.png"} alt="img" />
                            </Box>  </Box>
                    </Grid>
                </main>
            </Grommet>
        );
    }
}

export default NodePageMain;
