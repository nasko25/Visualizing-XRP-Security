import { Component } from "react";
import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import 'bootstrap/dist/css/bootstrap.min.css'
import { MDBContainer } from 'mdbreact';
import {List, InfiniteLoader, AutoSizer} from 'react-virtualized';

export default class DashboardList extends Component {

    constructor(props) {
        super(props);

        // need to bind "this" to the rowRenderer function, so we can use "this" in the function
        this.rowRenderer = this.rowRenderer.bind(this);
    }

    noRowsRenderer() {
        return <div >No rows</div>;
    }

    rowRenderer({index, isScrolling, key, style}) {
        let name = 'item_darker';

        if (index % 2 != 0) {
            name = 'item_lighter';
        }

        return (
            <div style = {style} key = {key} className={name}>
                <ListGroup.Item>
                    <span className='item'>
                        IP : {
                            this.props.data[index].IP === "undefined" ? "IP Hidden": this.props.data[index].IP
                        } | 
                        Version : {this.props.data[index].rippled_version} | 
                        Public Key : {this.props.data[index].public_key} | 
                        Uptime : {this.props.data[index].uptime} | 
                        Trust Score : {this.props.data[index].trustScore}
                    </span> 
                </ListGroup.Item>
            </div>
        );
  }

    render() {
        return (
            <div className='list'>
                <ListGroup>
                    <List
                        rowRenderer={this.rowRenderer}
                        rowCount={this.props.data.length}
                        height={620}
                        rowHeight={40}
                        width= {1400}
                        overscanRowCount = {10}
                        noRowsRenderer={this.noRowsRenderer}
                    />
                </ListGroup>
            </div>
        )
    }
}
