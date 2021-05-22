
import React from "react";
import { Box, Button, Grid, Grommet, Header, Heading, List, Main, Menu, Nav, Tab, Table, TableBody, TableCell, TableHeader, TableRow, Text, TextInput } from 'grommet'
import NodePeerGraph from "./NodePeerGraph";


class NodePageMain extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            node_info: {}
        };
        this.getNodeInfo = this.getNodeInfo.bind(this);
        if (this.props.node_info) {
            this.setState({ node_info: this.props.node_info });
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
                            <Heading size="3xl" weight="bold" color="t">Node Page</Heading>
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
                            alignSelf="center"
                            justify="center"
                            gap="small">
                            <Text alignSelf="center" weight="bold">Search</Text>
                            <TextInput size="small" />
                        </Box>
                    </Grid>
                </Header>

                <Main>
                    <Grid
                        style={{ width: "100%", height: "90%" }}
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
                                style={{ width: "50%", alignSelf: "center" }}
                                primaryKey="name"
                                secondaryKey="value"
                                data={[
                                    { name: 'Security score', value: 0.9 },
                                    { name: 'rippled version', value: "1.7.0" },
                                    { name: 'IP', value: "92.123.145.165" },
                                    { name: 'Eric', value: 80 },
                                ]}
                            />
                        </Box>
                        <Box round="5%" border={{ color: "doc" }} margin="2%" gridArea="info" background="rgb(38, 38, 38)" color="doc">
                            Info
                        </Box>
                    </Grid>
                </Main>
            </Grommet>
        );
    }
}

export default NodePageMain;