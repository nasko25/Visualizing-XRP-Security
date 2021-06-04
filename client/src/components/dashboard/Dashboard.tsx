import { Component } from "react";
import DashboardNavbar from "./DashboardNavbar";
import DashboardList from "./DashboardList";
import TopMap from "../TopMap";
import axios from 'axios';
import { Box, Grid, Grommet, Header, Heading, List } from 'grommet';
import { History } from 'history';

let dataJson = require("../../nodes.json");

export type DashboardProps = {
    history: History
}

var SETUP = {
    header_height: 7.5,
    hd_bgnd: '#C3C3C3',
}

var COLORS = {
    main: "#383838",
    button: "#212529",
    nav: "#1a1a1a"
}

export default class Dashboard extends Component<DashboardProps> {
    // Hardcoded data for example purposes for the midterm presentaion
    // Will be removed when website is fully functional

    // list needs to check whether selected is null
    // dashboard will have a function that will be passed down to topmap
    // said function will update the state when an onclick event is triggered
    // state is updated to have the public key of the node clicked on

    data = dataJson.data;
    timer = undefined;
    state = {
        nodes: [],
        selected: "",
        loaded: false,
    }

    constructor(props: any) {
        super(props);
        this.state = { nodes: [], selected: "", loaded: false };

        this.refresh_data = this.refresh_data.bind(this);
        this.selectNode = this.selectNode.bind(this);
    }

    componentDidMount() {
        this.refresh_data();
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    selectNode(pub_key: string) {
        this.setState({ selected: pub_key });
        console.log("PUB KEY UPDATED : " + this.state.selected);
    }

    getData() {
        return axios.get("http://localhost:8080/node/get-all-nodes").then(response => {
            console.log(response.data);
            this.setState({ nodes: response.data });
        }).then(response => {
            this.setState({ loaded: true })
        });
    }

    refresh_data() {
        this.getData();
        console.log("Node info updated...");
        setTimeout(this.refresh_data, 300000);
    }

    getNodeInfo() {
        var peers = [];
        for (var i = 0; i < 50; i++) {
            peers.push({ trust_score: Math.random() });
        }
        return {
            public_key: "n9MozjnGB3tpULewtTsVtuudg5JqYFyV3QFdAtVLzJaxHcBaxuXD",
            IP: "34.221.161.114",
            peers: peers,
            trust_score: 1,
        }
    }

    createGenInfo() {
        return <List
            style={{ width: "70%", height: "70%", alignSelf: "center" }}

            primaryKey="name"
            secondaryKey="value"

            data={[
                { name: 'Nodes', value: this.state.nodes.length},

            ]}
        />
    }

    render() {
        return (
            // <div className='Dashboard'>
            <Grommet style={{height: '100%', width: '100%'}}>
                <Header style={{width: '100%', height: `${SETUP.header_height}%`, backgroundColor: COLORS.nav}}>
                    <DashboardNavbar history={this.props.history}/>
                </Header>
                <div className='DashboardMain' style={{width: '100%', height: `${100 - SETUP.header_height}%`}}>
                    <Grid
                        rows={["2/3", "1/3"]}
                        columns={["1/2", "1/2"]}
                        // gap={"small"}
                        areas={[
                            { name: "map", start: [0, 0], end: [0, 0.5] },
                            { name: "info", start: [0, 1], end: [0, 1] },
                            { name: "table", start: [1, 0], end: [1, 1] }
                        ]}
                        style={{width: '100%', height: '100%'}}
                    >
                        <Box gridArea="map" margin={{top: "2%", left: "2%", right: "1%", bottom: "1%"}} round='1%' background={COLORS.main} justify='center' align='center'>
                            { this.state.loaded ? (<TopMap data={this.state.nodes} handleChange={this.selectNode} />) : 
                            (<div id="loader" style={{ position: "absolute", top: "40%" }} >
                                <img width="10%" 
                                    style={{ animation: `spin 3s linear infinite`,
                                    marginLeft: "auto",
                                    marginRight: "auto"}} 
                                    src={"https://i.pinimg.com/originals/e6/9d/92/e69d92c8f36c37c84ecf8104e1fc386d.png"}
                                ></img>
                            </div>)}
                        </Box>
                        <Box gridArea="table" background={COLORS.main} margin={{top: "2%", left: "1%", right: "2%", bottom: "1%"}} round='1%' justify='center' align='center'>
                            { this.state.loaded ? (<DashboardList arrNodesData={this.state.nodes} selected={this.state.selected} history={this.props.history} />) : 
                            (<div id="loader" style={{ position: "absolute", top: "40%" }} >
                                <img width="10%" 
                                    style={{ animation: `spin 3s linear infinite`,
                                    marginLeft: "auto",
                                    marginRight: "auto"}} 
                                    src={"https://i.pinimg.com/originals/e6/9d/92/e69d92c8f36c37c84ecf8104e1fc386d.png"}
                                ></img>
                            </div>)}
                        </Box>
                        <Box gridArea="info" background={COLORS.main} margin={{top: "1%", left: "2%", right: "1%", bottom: "1%"}} round='1%' justify='center' align='center'>
                            <Heading size="100%" margin="2%"> General Information </Heading>
                            {this.createGenInfo()}
                        </Box>
                    </Grid>
                </div>
                {/* </div> */}
            </Grommet>
        );
    }
}