import { Component } from "react";
import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import 'bootstrap/dist/css/bootstrap.min.css'
import { MDBContainer } from 'mdbreact';
import {List, InfiniteLoader, AutoSizer} from 'react-virtualized';

export default class DashboardList extends Component {
    nodes = [];

    constructor(props) {
        super(props);
        this.data = this.props.data;
        this.state = {nodes: []};

        // need to bind "this" to the rowRenderer function, so we can use "this" in the function
        this.rowRenderer = this.rowRenderer.bind(this);

        console.log(this.nodes)
    }
    componentDidMount() {
        this.createList();
    }

    noRowsRenderer() {
        return <div >No rows</div>;
    }

    rowRenderer({index, isScrolling, key, style}) {
        // let IP = this.state.nodes[index].IP;
        // IP = IP === "undefined" ? "IP Hidden" : IP;
        return (
            <div style = {style} key = {key} >
                <ListGroup.Item>
                    <span className="ip">IP : {
                        this.state.nodes[index].IP === "undefined" ? "IP Hidden": this.state.nodes[index].IP
                    } | </span>
                    <span className="version">Version : {this.state.nodes[index].rippled_version} | </span>
                    <span className="public_key">Public Key : {this.state.nodes[index].public_key} | </span>
                    <span className="uptime">Uptime : {this.state.nodes[index].uptime} | </span>
                    <span className="security_metric">Security Metric : </span>
                </ListGroup.Item>
            </div>
        );
  }

    createList() {
        console.log("data")
        console.log(this.data)
        this.data.then(data => {
            console.log("here" + data[0].IP)
        /*for (let i=0; i< data.length; i++) {
            let updatedNodes = this.state.nodes.concat(<ListGroup.Item>
                    <span className="ip">IP</span>
                    <span className="version">Version</span>
                    <span className="public_key">Public Key</span>
                    <span className="uptime">Uptime</span>
                    <span className="security_metric">Security Metric</span>
                </ListGroup.Item>);
            this.setState({nodes: updatedNodes });*/
            this.setState({nodes: data});
            //}
        });
    }

    render() {
        return (
            <ListGroup>
                <List
                    rowRenderer={this.rowRenderer}
                    rowCount={this.state.nodes.length}
                    height={300}
                    rowHeight={40}
                    width= {600}
                    overscanRowCount = {10}
                    noRowsRenderer={this.noRowsRenderer}
                />
            </ListGroup>
        )
    }
}
