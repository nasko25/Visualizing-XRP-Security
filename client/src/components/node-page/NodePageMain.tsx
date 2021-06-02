import React from "react";
import { Box, DataChart, Grid, Grommet, Header, Heading, List, Text, TextInput } from 'grommet';
import { Search } from 'grommet-icons';
import Button from "react-bootstrap/Button";
import NodePeerGraph from "./NodePeerGraph";
import "./NodePage.css";
import { Port, Peer, NodePageState, NodePageProps, HistoricalScore, NodeInfoDB } from "./NodePageTypes";
import axios from 'axios';
import { Duration } from 'luxon';
import { humanizeUptime } from '../../helper';


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

    searchRef: React.RefObject<HTMLInputElement>;

    constructor(props: NodePageProps) {
        super(props);
        // The state
        this.state = {
            public_key: this.parseURL(),
            location: this.props.history.location,
            IP: "",
            peers: [],
            trust_score: 0,
            rippled_version: "",
            ports: [],
            historical_scores: [],
            uptime: 0
        }

        this.searchRef = React.createRef();

        /**
         * Binding the class methods to the 'this' keyword for the class
         */
        this.getNodeInfo = this.getNodeInfo.bind(this);
        this.onKeyPressSearch = this.onKeyPressSearch.bind(this);
        this.preparePortList = this.preparePortList.bind(this);
        this.createDataChart = this.createDataChart.bind(this);
        this.nodeOnClick = this.nodeOnClick.bind(this);
        this.queryAPI = this.queryAPI.bind(this);
        this.queryAPI_node = this.queryAPI_node.bind(this);
        this.parseURL = this.parseURL.bind(this);
        this.historyListener = this.historyListener.bind(this);
    }

    componentDidMount() {
        this.getNodeInfo(this.state.public_key);
        this.historyListener();
    }

    historyListener() {
        this.props.history.listen((location) => {
            this.getNodeInfo(location.search.split("?public_key=")[1]);
            console.log("history change" + location.pathname + location.search);
            console.log(location.search.split("?public_key=")[1]);
        });
    }

    parseURL(): string {
        return this.props.history.location.search.split("?public_key=")[1];
    }

    queryAPI(public_key: string) {
        return axios.get("http://localhost:8080/node/peers?public_key=" + public_key).then((res) => {
            var peers: Peer[] = [];
            for (var i = 0; i < res.data.length; i++) {
                peers.push({ public_key: res.data[i].end_node, score: parseFloat(((Math.random() + 1) / 2).toFixed(3)) })
            }
            this.setState({peers: peers});
        }).catch((e) => {
            console.log(e.response);
        });
    }

    queryAPI_node(public_key: string) {
        return axios.get("http://localhost:8080/node/info?public_key=" + public_key).then((res) => {
            var info: NodeInfoDB = res.data[0];
            var ports: Port[] = [];
            if (info.ports) {
                for (var i = 0; i < info.ports.length; i++) {
                    ports.push({ port_number: info.ports[i], service: info.protocols[i], version: "Not Implemented yet" })
                }
            }
            this.setState(
                {
                    IP: info.IP,
                    rippled_version: info.rippled_version,
                    uptime: info.uptime,
                    ports: ports,
                });
            console.log("state" + this.state.peers);
        }).catch((error) => {
            console.log(error.response);
        });
    }

    getNodeInfo(public_key: string) {
        var history: HistoricalScore[] = [];
        for (var i = 1; i <= 30; i++) {
            history.push({ date: "2020-08-" + i, score: parseFloat(((Math.random() + 1) / 2).toFixed(3)) });
        }
        this.setState({ historical_scores: history, public_key: public_key });
        this.queryAPI(this.state.public_key);
        this.queryAPI_node(this.state.public_key);
    }

    createDataChart() {
        return (
            <DataChart
                data={this.state.historical_scores}
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

    /**
     * Event Handler for the Search Bar
     */
    onKeyPressSearch(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.code === "Enter") {
            let text: string = this.searchRef.current?.value === undefined
                ? ""
                : this.searchRef.current?.value;
            this.props.history.push('/node?public_key=' + text);
            // this.searchRef.current?.setAttribute('value', '');
        }
    }

    preparePortList() {
        var ports: string = "";
        var thisPorts = this.state.ports;
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
        return <List
            style={{ alignSelf: "center" }}
            primaryKey="public_key"
            secondaryKey="score"
            data={this.state.peers.sort((a, b) => {
                return b.score - a.score;
            })}
            border={false}
            alignSelf="center"
        />
    }

    nodeOnClick(public_key: string) {
        this.props.history.push("/node?public_key=" + public_key);
    }

    render() {
        return (
            <Grommet
                style={{ width: "100%", height: "100%" }}>
                {/* // theme={{ global: { colors: { hd_bgnd: SETUP.hd_bgnd, t: "#000000" } } }} */}

                <Header background={COLORS.nav} style={{ width: "100%", height: `${SETUP.header_height}%` }} >
                    <Grid
                        style={{ width: "100%", height: "100%" }}
                        rows={["1"]}
                        columns={["1/5", "1/5", "1/5", "1/5", "1/5"]}
                        areas={[
                            { name: 'heading', start: [0, 0], end: [0, 0] },
                            { name: 'button_stock', start: [1, 0], end: [1, 0] },
                            { name: 'button_validator', start: [2, 0], end: [2, 0] },
                            { name: 'button_about', start: [3, 0], end: [3, 0] },
                            { name: 'search', start: [4, 0], end: [4, 0] },
                        ]}>

                        {/* The heading. */}
                        <Heading margin="2%" gridArea="heading" alignSelf="center" size="small">Node Page</Heading>

                        {/* The Button for returning to the main page. */}
                        <Box
                            height="80%"
                            gridArea="button_stock"
                            justify="center"
                            alignSelf="center"
                            margin="2%">
                            <Button
                                variant="dark"
                                onClick={() => this.props.history.push("/")}
                                style={{ width: "80%", height: "80%", alignSelf: "center" }} >
                                <Text>Stock</Text>
                            </Button>
                        </Box>

                        <Box
                            height="80%"
                            gridArea="button_validator"
                            justify="center"
                            alignSelf="center"
                            margin="2%">
                            <Button
                                variant="dark"
                                onClick={() => this.props.history.push("/validators")}
                                style={{ width: "80%", height: "80%", alignSelf: "center" }} >
                                <Text>Validators</Text>
                            </Button>
                        </Box>

                        <Box
                            height="80%"
                            gridArea="button_about"
                            justify="center"
                            alignSelf="center"
                            margin="2%">
                            <Button
                                variant="dark"
                                onClick={() => this.props.history.push("/about")}
                                style={{ width: "80%", height: "80%", alignSelf: "center" }} >
                                <Text>About</Text>
                            </Button>
                        </Box>

                        {/* The Search Bar */}
                        <Box gridArea="search"
                            alignSelf="center"
                            direction="row"
                            justify="center"
                            background={COLORS.button}
                            margin={{ left: "1%", right: "3%" }}>
                            <TextInput
                                onKeyPress={this.onKeyPressSearch}
                                icon={<Search />}
                                textAlign="center"
                                placeholder="Search Public Key"
                                ref={this.searchRef}
                            />
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
                            <NodePeerGraph on_node_click={this.nodeOnClick} public_key={this.state.public_key} peers={this.state.peers} history={this.props.history}></NodePeerGraph>
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
