import React from "react";
import { Box, DataChart, Grid, Grommet, Header, Heading, List, Text, TextInput } from 'grommet'
import Button from "react-bootstrap/Button";
import NodePeerGraph from "./NodePeerGraph";
import "./NodePage.css";
import { Link } from "react-router-dom";
import { LocationDescriptor } from 'history';
import { Port, Peer, NodePageState, NodePageProps, HistoricalScore, NodeInfoDB } from "./NodePageTypes";
import axios from 'axios';


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
    button: "#212529",
    nav: "#1a1a1a"
}

class NodePageMain extends React.Component<NodePageProps, NodePageState> {

    constructor(props: NodePageProps) {
        super(props);

        // The state
        this.state = {
            public_key: this.parseURL(),
            location: this.props.history.location,
            node_info: this.props.node_info ? this.props.node_info : {
                public_key: "",
                IP: "",
                peers: [],
                trust_score: 0,
                rippled_version: "",
                ports: [],
                history: [],
                uptime: 0
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
        this.queryAPI = this.queryAPI.bind(this);
        this.queryAPI_node = this.queryAPI_node.bind(this);
        this.parseURL = this.parseURL.bind(this);
        this.goBack = this.goBack.bind(this);
        this.historyListener = this.historyListener.bind(this);
    }
    componentDidMount() {
        this.getNodeInfo(this.state.public_key);
        this.historyListener();
    }

    historyListener() {
        this.props.history.listen((location) => {
            this.getNodeInfo(this.parseURL());
            this.setState({location: location});
        });
    }

    parseURL(): string {
        return this.props.location.search.split("\?public_key=")[1];
    }

    queryAPI(public_key: string) {
        return axios.get("http://localhost:8080/node/peers?public_key=" + public_key).then((res) => {
            var peers: Peer[] = [];
            for (var i = 0; i < res.data.length; i++) {
                peers.push({ public_key: res.data[i].end_node, score: parseFloat(((Math.random() + 1) / 2).toFixed(3)) })
            }
            this.setState(
                {
                    node_info: {
                        IP: this.state.node_info.IP,
                        history: this.state.node_info.history,
                        ports: this.state.node_info.ports,
                        public_key: this.state.node_info.public_key,
                        trust_score: this.state.node_info.trust_score,
                        peers: peers,
                        rippled_version: this.state.node_info.rippled_version,
                        uptime: this.state.node_info.uptime
                    }
                });
        }).catch((e) => {
            console.log(e.response);
        });
    }

    queryAPI_node(public_key: string) {
        return axios.get("http://localhost:8080/node/info?public_key=" + public_key).then((res) => {
            // console.log(res.data);
            var info: NodeInfoDB = res.data[0];
            // console.log(info);

            var ports: Port[] = [];
            if (info.ports) {
                for (var i = 0; i < info.ports.length; i++) {
                    ports.push({ port_number: info.ports[i], service: info.protocols[i], version: "Not Implemented yet" })
                }
            }

            this.setState(
                {
                    node_info: {
                        IP: info.IP,
                        history: this.state.node_info.history,
                        ports: ports,
                        public_key: this.state.node_info.public_key,
                        trust_score: this.state.node_info.trust_score,
                        peers: this.state.node_info.peers,
                        rippled_version: info.rippled_version,
                        uptime: info.uptime
                    }
                });
        }).catch((error) => {
            console.log(error.response);
        });
    }

    getNodeInfo(public_key: string) {
        var history: HistoricalScore[] = [];
        for (var i = 1; i <= 30; i++) {
            history.push({ date: "2020-08-" + i, score: parseFloat(((Math.random() + 1) / 2).toFixed(3)) });
        }

        var info = {
            public_key: public_key,
            IP: this.state.node_info.IP,
            peers: this.state.node_info.peers,
            trust_score: 0,
            ports: this.state.node_info.ports,
            rippled_version: this.state.node_info.rippled_version,
            history: history,
            uptime: this.state.node_info.uptime
        };
        this.setState({ public_key: public_key, node_info: info });
        this.queryAPI(this.state.public_key);
        this.queryAPI_node(this.state.public_key);
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
        // this.setState({ displayGreen: !this.state.displayGreen });
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
                { name: 'Rippled version', value: this.state.node_info.rippled_version },
                { name: 'Ports', value: this.preparePortList() },
                { name: 'Uptime', value: this.state.node_info.uptime },
                { name: 'Peer count', value: this.state.node_info.peers.length },
            ]}
        />
    }

    createPeerList() {
        return <List
            style={{ alignSelf: "center" }}
            primaryKey="public_key"
            secondaryKey="score"
            data={this.state.node_info.peers.sort((a, b) => {
                return b.score - a.score;
            })}
            border={false}
            alignSelf="center"
        />
    }

    goBack() {
        // console.log(this.props.history);
        this.props.history.goBack();
    }

    nodeOnClick(public_key: string) {
        this.props.history.push("/node?public_key=" + public_key);
        this.setState({ public_key: public_key });
        this.getNodeInfo(public_key);
    }

    render() {
        return (
            <Grommet
                style={{ width: "100%", height: "100%" }}
                theme={{ global: { colors: { hd_bgnd: SETUP.hd_bgnd, t: "#000000" } } }} >

                <Header background={COLORS.nav} style={{ width: "100%", height: `${SETUP.header_height}%` }} >
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
                                onClick={this.goBack}
                                style={{ width: "80%", height: "80%", alignSelf: "center" }} >
                                {/* <Link to='/' className='link' style={{textDecoration: 'none', color: 'inherit'}}>
                                    <Text size="large" weight="bold">Back To Homepage</Text>
                                </Link> */}
                            </Button>
                        </Box>

                        {/* The Search Bar */}
                        <Box gridArea="search"
                            alignSelf="center"
                            direction="row"
                            justify="center"
                            background={COLORS.button}
                            margin={{ left: "1%", right: "2%" }}>
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
                            { name: 'peers_network', start: [1, 0], end: [1, 0] },
                            { name: 'stats', start: [0, 0], end: [0, 1] },
                            { name: 'info', start: [1, 1], end: [1, 1] },
                        ]}>
                        <Box round="1%" margin={{ top: "2%", left: "1%", right: "2%", bottom: "1%" }} gridArea="peers_network" background={COLORS.main}>
                            <NodePeerGraph on_node_click={this.nodeOnClick} node_info={this.state.node_info} history={this.props.history}></NodePeerGraph>
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
                        <Box round="1%" pad={{ left: "5%", right: "5%" }} justify="center" margin={{ top: "1%", left: "1%", right: "2%", bottom: "2%" }} gridArea="info" background={COLORS.main} color="hd_bgnd">
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
