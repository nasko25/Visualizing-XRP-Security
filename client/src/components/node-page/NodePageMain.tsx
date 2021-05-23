
import React, { ChangeEvent, ReactPropTypes } from "react";
import { Box, Button, Grid, Grommet, Header, Heading, KeyPress, List, Main, Menu, Nav, Tab, Table, TableBody, TableCell, TableHeader, TableRow, Text, TextInput } from 'grommet'
import NodePeerGraph from "./NodePeerGraph";

type NodePageProps = {
    node_info?: any,
    key: string
}

class NodePageMain extends React.Component<NodePageProps> {

    // The state
    state = {
        key: "",
        node_info: {},
        speed: 3
    }

    constructor(props: NodePageProps) {
        super(props);
        this.state.key = props.key;

        this.getNodeInfo = this.getNodeInfo.bind(this);
        
        if (props.node_info) {
            this.setState({ node_info: props.node_info });
            console.log(this.state, "not bruh");
        } else {
            // this.setState({ node_info: this.getNodeInfo() });
            this.setState({ node_info: "bruh" }, () => {
                console.log("niiiiice");
            });
            // console.log(this.state, "bruh");
        }
        // console.log(this.state);
    }

    // Just for testing
    // Should actually send a request to server if props is empty
    getNodeInfo() {
        var peers = [];
        for (var i = 0; i < 50; i++) {
            peers.push({ trust_score: Math.random() });
        }
        var info = {
            public_key: "n9MozjnGB3tpULewtTsVtuudg5JqYFyV3QFdAtVLzJaxHcBaxuXD",
            IP: "34.221.161.114",
            peers: peers,
            trust_score: 1,
        };
        // this.setState({ node_info: info }, () => {
        //     console.log("nice");
        // });
        // console.log(info);
        // console.log(this.state.node_info);
        return info;
    }

    // Event Handler for the Search Bar
    onKeyPressSearch(e: React.KeyboardEvent<HTMLInputElement>) {
        if(e.code === "Enter") alert("Search Triggered! Key entered is: " + e.currentTarget.value);
        // TODO send request to check for the key
        // If key exists and information is obtained, render a green button to lead to the page
        // If not, render a red box with message
    }

    render() {
        return (
            <Grommet
                style={{ width: "100%", height: "100%" }}
                theme={{ global: { colors: { doc: '#C3C3C3', t: "#000000" } } }} >

                <Header background="doc" style={{ width: "100%", height: "10%" }} >
                    <Grid
                        style={{ width: "100%", height: "100%" }}
                        rows={["xsmall"]}
                        gap="medium"
                        columns={["1/5", "2/5", "2/5"]}
                        areas={[
                            { name: 'heading', start: [0, 0], end: [0, 0] },
                            { name: 'button_return', start: [1, 0], end: [1, 0] },
                            { name: 'search', start: [2, 0], end: [2, 0] },
                        ]}>
                        <Box
                            gridArea="heading"
                            alignSelf="center" >
                            <Heading size="3xl" color="t">Node Page</Heading>
                        </Box>
                        <Box
                            height="80%"
                            gridArea="button_return"
                            justify="center"
                            alignSelf="center"
                            background="#909090">
                            <Button alignSelf="center" style={{ width: "80%" }}>
                                <Text color="#383838" size="large" weight="bold">Back To Homepage</Text>
                            </Button>
                        </Box>
                        <Box gridArea="search"
                            alignSelf="center"
                            direction="row"
                            justify="center"
                            gap="small"
                            margin="10px">
                            <Text alignSelf="center" weight="bold">Search</Text>
                            <TextInput size="small" onKeyPress={this.onKeyPressSearch}/>
                        </Box>
                    </Grid>
                </Header>

                <main style={{ width: "100%", height: "90%" }}>
                    <Grid
                        style={{ width: "100%", height: "100%" }}
                        rows={["1/2", "1/2"]}
                        columns={["1/2", "1/2"]}
                        areas={[
                            { name: 'map', start: [0, 0], end: [0, 0] },
                            { name: 'stats', start: [1, 0], end: [1, 1] },
                            { name: 'info', start: [0, 1], end: [0, 1] },
                        ]}>
                        <Box round="5%" border={{ color: "doc" }} margin="2%" gridArea="map" background="rgb(38, 38, 38)">
                            {/* <NodePeerGraph node_info={this.state.node_info === {} ? this.getNodeInfo() : this.state.node_info}></NodePeerGraph> */}
                            <NodePeerGraph node_info={this.getNodeInfo()}></NodePeerGraph>
                        </Box>
                        <Box round="5%" border={{ color: "doc" }} margin="2%" gridArea="stats" background="rgb(38, 38, 38)">
                            <List
                                style={{ width: "70%", height:"70%", alignSelf: "center"}}

                                primaryKey="name"
                                secondaryKey="value"
                                
                                data={[
                                    { name: 'Security score', value: 0.9 },
                                    { name: 'rippled version', value: "1.7.0" },
                                    { name: 'IP', value: "92.123.145.165" },
                                    { name: 'Eric', value: 80 },
                                ]}
                            />
                            <Box  style={{height: "30%"}} margin="2%" round="20px" border={{ color: "doc" }} background="rgb(70, 70, 38)">
                            <List
                                style={{ width: "70%", alignSelf: "center"}}

                                primaryKey="key"
                                secondaryKey="score"
                                
                                data={[
                                    { key: 'r910920', score: 0.9 },
                                    { key: 'r92e988', score: 1.0 },
                                    { key: 'r23r3e2', score: 0.23 },
                                    { key: 'r923rrfr', score: 0.00001 },
                                ]}
                            />
                            </Box>
                        </Box>
                        <Box round="5%" border={{ color: "doc" }} margin="2%" gridArea="info" background="rgb(38, 38, 38)" color="doc">
                            <Text size="xlarge">Info</Text>
                            <Box margin="20px" alignSelf="center" width="200px" height="200px">
                            <img width="100%" style={{  animation: `spin ${this.state.speed}s linear infinite`}}  src={"https://i.pinimg.com/originals/e6/9d/92/e69d92c8f36c37c84ecf8104e1fc386d.png"} alt="img"/>
                            </Box>  </Box>
                    </Grid>
                </main>
            </Grommet>
        );
    }
}

export default NodePageMain;
