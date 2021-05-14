import { Component } from "react";
import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import 'bootstrap/dist/css/bootstrap.min.css'
import { MDBContainer } from 'mdbreact';

let nodes = [];

for (let i=0; i<15; i++) {
    nodes.push(<ListGroup.Item>
            <span className="ip">IP</span>
            <span className="version">Version</span>
            <span className="public_key">Public Key</span>
            <span className="uptime">Uptime</span>
            <span className="security_metric">Security Metric</span>
        </ListGroup.Item>);
}

export default class DashboardList extends Component {
    data = [];

    constructor(props, data) {
        super(props);
        this.state = {};
        this.data = data;
    }

    

    render() {
        return (
            <div className='list'>
                <div className='list_inner'>
                    <MDBContainer>
                        <div className="scrollbar scrollbar-primary  mt-5 mx-auto">
                            <ListGroup className='list_group'>
                                {nodes}
                            </ListGroup>
                        </div>
                    </MDBContainer>
                </div>
            </div>
        )
    }
}