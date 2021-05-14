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

    }
    componentDidMount() {
        this.createList();
    }

    _noRowsRenderer() {
        return <div >No rows</div>;
    }
    _rowRenderer({index, isScrolling, key, style}) {
        return (
            <div style = {style} key = {key} >
                <span className="ip">IP {index} </span>
                    <span className="version">Version</span>
                    <span className="public_key">Public Key</span>
                    <span className="uptime">Uptime</span>
                    <span className="security_metric">Security Metric</span>
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
            <List
                ref = "List"
    rowRenderer={this._rowRenderer}
                rowCount={this.state.nodes.length}
                height={300}
                rowHeight={40}
                width= {600}
                overscanRowCount = {10}
    noRowsRenderer={this._noRowsRenderer}
            />
        )
    }
}
