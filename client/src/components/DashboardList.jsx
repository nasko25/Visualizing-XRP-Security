import { Component } from "react";
import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import 'bootstrap/dist/css/bootstrap.min.css'
import { MDBContainer } from 'mdbreact';

export default class DashboardList extends Component {
    nodes = [];

    constructor(props) {
        super(props);
        this.state = {};
    }

    createList() {
        for (let i=0; i<this.props.data.length; i++) {
            this.nodes.push(<ListGroup.Item>
                    <span className="ip">IP</span>
                    <span className="version">Version</span>
                    <span className="public_key">Public Key</span>
                    <span className="uptime">Uptime</span>
                    <span className="security_metric">Security Metric</span>
                </ListGroup.Item>);
        }
        return this.nodes;
    }

    

    render() {
        return (
            <div className='list'>
                <div className='list_inner'>
                    <MDBContainer>
                        <div className="scrollbar scrollbar-primary  mt-5 mx-auto">
                            <ListGroup className='list_group'>
                                {this.createList()}
                            </ListGroup>
                        </div>
                    </MDBContainer>
                </div>
            </div>
        )
    }
}
