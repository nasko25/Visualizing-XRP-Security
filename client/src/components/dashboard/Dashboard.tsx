import { Component } from "react";
// import DashboardNavbar from "../DashboardNavbar";
import DashboardList from "./DashboardList";
import TopMap from "../TopMap";
import axios from 'axios';
import { Box, Grid, Grommet, Header, Heading, List } from 'grommet';
import { History } from 'history';
import { COLORS, SETUP } from '../../style/constants';
import Loader from "../Loader";
import NavigationBar from "../NavigationBar";
import { Point } from '../TopMap';

export type DashboardProps = {
    history: History
}

export type Node = {
    rippled_version: string,
    public_key: string,
    uptime: number,
    longtitude: number,
    latitude: number,
    score: number
}

export type DashboardState = {
    nodes: Node[],
    selected: string,
    loaded: boolean
}

/**
 * A component that displays the Stock Node Dashboard
 */
export default class Dashboard extends Component<DashboardProps, DashboardState> {

    timer = undefined;
    /**
     * Local state
     */
    // state = {
    //     nodes: [],
    //     selected: "",
    //     loaded: false,
    // }

    constructor(props: any) {
        super(props);
        this.state = { nodes: [], selected: "", loaded: false };

        /**
         * Binding the class methods to the 'this' keyword so that it can be used inside them
         */
        this.refresh_data = this.refresh_data.bind(this);
        this.selectNode = this.selectNode.bind(this);
        this.getData = this.getData.bind(this);
    }

    /**
     * Fetches all needed information from the server and start a timeout to refresh the data
     * once the component has been mounted.
     */
    componentDidMount() {
        this.refresh_data();
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    /**
     * Changes the public key in the state to the public key of a selected node on the map
     * @param pub_key The public key of the selected node on the map
     */
    selectNode(pub_key: string) {
        this.setState({ selected: pub_key });
        console.log("PUB KEY UPDATED : " + this.state.selected);
    }

    /**
     * Fetches all needed data from the server by creating an http request to the required endpoint
     * Changes the loaded flag in state once the request has been processed and information has been received.
     * @returns An array with the nodes given by the http response
     */
    getData() {
        return axios.get("http://" + window.location.hostname + ":8080/node/get-all-nodes-and-score").then(response => {
            console.log(response.data);
            this.setState({ nodes: response.data });
        }).then(response => {
            this.setState({ loaded: true })
        }).catch((e) => {
            console.log(e.response);
        });
    }

    /**
     * Calls a function to fetch all needed data from the server and sets a timeout to refresh the data
     * every X minutes
     */
    refresh_data() {
        this.getData();
        console.log("Node info updated...");
        setTimeout(this.refresh_data, 300000);
    }

    getAverageSecurity() {
        let avg: number = 0;
        console.log("L : " + this.state.nodes.length)
        for (let i=0; i<this.state.nodes.length; i++) {
            avg+= parseFloat(`${this.state.nodes[i].score}`);
        }

        avg = avg/this.state.nodes.length;

        return avg.toFixed(2);
    }

    /**
     * Creates the list containing general information regarding the network
     * @returns The list
     */
    createGenInfo() {
        return <List
            style={{ width: "70%", height: "70%", alignSelf: "center" }}

            primaryKey="name"
            secondaryKey="value"

            data={[
                { name: 'Nodes', value: this.state.nodes.length },
                { name: 'Average security score', value: this.getAverageSecurity()},
                { name: 'Average trust score', value: "0"},
                { name: 'Latest version', value: "1.7.2"}
            ]}
        />
    }

    render() {
        return (
            <Grommet style={{ height: '100%', width: '100%' }}>
                <Header style={{ width: '100%', height: `${SETUP.header_height}%`, backgroundColor: COLORS.nav }}>
                    <NavigationBar title="Dashboard"></NavigationBar>
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
                            {this.state.loaded ? (<TopMap data={this.state.nodes.map((node) => {
                                let point: Point = {
                                    longtitude: node.longtitude,
                                    latitude: node.latitude,
                                    public_key: node.public_key
                                }
                                return point
                            })} handleChange={this.selectNode} />) :
                                <Loader top={45}/>}
                        </Box>
                        <Box gridArea="table" background={COLORS.main} margin={{ top: "2%", left: "1%", right: "2%", bottom: "1%" }} round='1%' justify='center' align='center' overflow='auto'>
                            {this.state.loaded ? (<DashboardList arrNodesData={this.state.nodes} selected={this.state.selected} history={this.props.history} />) :
                                <Loader top={47}/>}
                        </Box>
                        <Box gridArea="info" background={COLORS.main} margin={{ top: "1%", left: "2%", right: "1%", bottom: "1%" }} round='1%' justify='center' align='center' overflow='auto'>
                            <Heading size="100%"> General Information </Heading>
                            {this.createGenInfo()}
                        </Box>
                    </Grid>
                </div>
            </Grommet>
        );
    }
}