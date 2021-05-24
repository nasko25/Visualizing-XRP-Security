import { Component } from "react";
import React from 'react';
import DashboardNavbar from "../components/DashboardNavbar";
import DashboardList from "../components/DashboardList";
import DashboardChart from "../components/DashboardChart";
import TopMap from "../components/TopMap";
import axios from 'axios';
let dataJson = require("../nodes.json");

export default class Dashboard extends Component {
    // Hardcoded data for example purposes for the midterm presentaion
    // Will be removed when website is fully functional
    data = dataJson.data;

    constructor(props) {
        super(props);
        //this.state = {nodes: []};
        this.state = {nodes: this.data};

        this.update_state = this.update_state.bind(this);
    }

    componentDidMount() {
        // this.update_state();
    }

    componentWillUnmount() {
        // clearInterval(this.timer);
    }

    getData() {
        return axios.get("http://localhost:8080/get-all-nodes");
      }

    update_state() {
        this.getData().then(response => {
            this.setState({nodes: response.data});
        })
        console.log("Node info updated...");
        setTimeout(this.update_state, 300000);
    }

    render() {
        return(
            <div className='Dashboard'>
                <DashboardNavbar />
                <div className='test'>
                    <TopMap data={this.state.nodes}/>
                    <DashboardList data = {this.state.nodes} key={this.state.updateKey}/>
                </div>
                <DashboardChart />
            </div>
        );
    }


}