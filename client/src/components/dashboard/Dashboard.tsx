import { Component } from "react";
import DashboardNavbar from "./DashboardNavbar";
import DashboardList from "./DashboardList";
import TopMap from "../TopMap";
import axios from 'axios';

let dataJson = require("../../nodes.json");

export default class Dashboard extends Component {
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
        selected: ""
    }

    constructor(props : any) {
        super(props);
        this.state = { nodes: [], selected: "" };

        this.update_state = this.update_state.bind(this);
        this.selectNode = this.selectNode.bind(this);
    }

    componentDidMount() {
        this.update_state();
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    selectNode(pub_key: string) {
        this.setState({selected: pub_key});
        console.log("PUB KEY UPDATED : " + this.state.selected);
    }

    getData() {
        return axios.get("http://localhost:8080/node/get-all-nodes");
      }

    update_state() {
        this.getData().then(response => {
            console.log(response.data);
            this.setState({nodes: response.data});
        })
        console.log("Node info updated...");
        setTimeout(this.update_state, 300000);
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

    render() {
        return(
            <div className='Dashboard'>
                <div className='dashboard_nav'>
                <DashboardNavbar />
                </div>
                <div className='dashboard_body'>
                    <TopMap data={this.state.nodes} handleChange={this.selectNode} />
                    <DashboardList arrNodesData = {this.state.nodes} selected={this.state.selected} />
                </div>
            </div>
        );
    }
}