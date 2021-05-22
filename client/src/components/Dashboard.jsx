import { Component } from "react";
import React from 'react';
import DashboardNavbar from "../components/DashboardNavbar";
import DashboardList from "../components/DashboardList";
import DashboardChart from "../components/DashboardChart";
import TopMap from "../components/TopMap";
import axios from 'axios';
import {
    Route,
    BrowserRouter,
    Switch
} from 'react-router-dom'
import NodeInfo from "./node-page/NodeInfo";

export default class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {nodes: []};

        this.update_state = this.update_state.bind(this);
    }

    componentDidMount() {
        this.update_state();
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    getData() {
        return axios.get("http://localhost:8080/get-all-nodes").then(response => {
          console.log(response.data);
          return response.data;
        });
      }

    update_state() {
        let temp = this.getData();
        temp.then(data => {
            this.setState({nodes: data});
        })
        console.log("Node info updated...");
        setTimeout(this.update_state, 300000);
    }

    getNodeInfo() {
        var peers = [];
        for(var i = 0; i < 50; i++){
            peers.push({trust_score: Math.random()});
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

                <BrowserRouter>
                    <Switch>

                        <Route path={"/node-info"}>
                        {/*  Place the other page component here  */}
                        <NodeInfo node={this.getNodeInfo()}/>
                        </Route>
                        <Route path={"/"}>
                            <div className='Dashboard'>
                                <DashboardNavbar />
                                <div className='test'>
                                    <TopMap />
                                    <DashboardList data = {this.state.nodes} number={this.state.number} key={this.state.updateKey}/>
                                </div>

                                <DashboardChart />
                            </div>
                        </Route>
                    </Switch>
                </BrowserRouter>
        );
    }


}