import { Component } from "react";
// import DashboardNavbar from "../DashboardNavbar";
import DashboardList from "./DashboardList";
import TopMap from "../TopMap";
import axios from 'axios';
import { Box, Grid, Grommet, Header, Heading, List } from 'grommet';
import { History } from 'history';
import { COLORS, SETUP } from '../../style/constants';
import Loader from "../Loader";
import NodePageNavbar from "../NavigationBar";

export type DashboardProps = {
    history: History
}

/**
 * A component that displays the Stock Node Dashboard
 */
export default class Dashboard extends Component<DashboardProps> {
    // list needs to check whether selected is null
    // dashboard will have a function that will be passed down to topmap
    // said function will update the state when an onclick event is triggered
    // state is updated to have the public key of the node clicked on

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
        this.getData = this.getData.bind(this);
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
        return axios.get("http://" + window.location.hostname + ":8080/node/get-all-nodes").then(response => {
            console.log(response.data);
            this.setState({ nodes: response.data });
        }).then(response => {
            this.setState({ loaded: true })
        }).catch((e) => {
            console.log(e.response);
        });
    }

    refresh_data() {
        this.getData();
        console.log("Node info updated...");
        setTimeout(this.refresh_data, 300000);
    }

    createGenInfo() {
        return <List
            style={{ width: "70%", height: "70%", alignSelf: "center" }}

            primaryKey="name"
            secondaryKey="value"

            data={[
                { name: 'Nodes', value: this.state.nodes.length },
            ]}
        />
    }

    render() {
        return (
            <Grommet style={{ height: '100%', width: '100%' }}>
                <Header style={{ width: '100%', height: `${SETUP.header_height}%`, backgroundColor: COLORS.nav }}>
                    {/* <DashboardNavbar history={this.props.history} /> */}
                    <NodePageNavbar title="Dashboard" onSearch={() => {}} searchID=""></NodePageNavbar>
                </Header>
                <div className='DashboardMain' style={{ width: '100%', height: `${100 - SETUP.header_height}%` }}>
                    <Grid
                        rows={["2/3", "1/3"]}
                        columns={["1/2", "1/2"]}
                        areas={[
                            { name: "map", start: [0, 0], end: [0, 0.5] },
                            { name: "info", start: [0, 1], end: [0, 1] },
                            { name: "table", start: [1, 0], end: [1, 1] }
                        ]}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <Box gridArea="map" style={{ position: "relative" }}margin={{ top: "2%", left: "2%", right: "1%", bottom: "1%" }} round='1%' background={COLORS.main} justify='center' align='center'>
                            {this.state.loaded ? (<TopMap data={this.state.nodes} handleChange={this.selectNode} />) :
                                <Loader top={45}/>}
                        </Box>
                        <Box gridArea="table" background={COLORS.main} margin={{ top: "2%", left: "1%", right: "2%", bottom: "1%" }} round='1%' justify='center' align='center'>
                            {this.state.loaded ? (<DashboardList arrNodesData={this.state.nodes} selected={this.state.selected} history={this.props.history} />) :
                                <Loader top={47}/>}
                        </Box>
                        <Box gridArea="info" background={COLORS.main} margin={{ top: "1%", left: "2%", right: "1%", bottom: "1%" }} round='1%' justify='center' align='center'>
                            <Heading size="100%" margin="2%"> General Information </Heading>
                            {this.createGenInfo()}
                        </Box>
                    </Grid>
                </div>
            </Grommet>
        );
    }
}