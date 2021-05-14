import { Component } from "react";
import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import 'bootstrap/dist/css/bootstrap.min.css'
import { MDBContainer } from 'mdbreact';

export default class DashboardList extends Component {
    nodes = [];

    constructor(props) {
        super(props);
        this.data = this.props.data;
        this.state = {nodes: []};

        this.createList();
    }
    componentDidMount() {
    }

    createList() {
        console.log("data")
        console.log(this.data)
        this.data.then(data => {
            console.log("here" + data[0].IP)
        for (let i=0; i< data.length; i++) {
            let updatedNodes = this.state.nodes.concat(<ListGroup.Item>
                    <span className="ip">IP</span>
                    <span className="version">Version</span>
                    <span className="public_key">Public Key</span>
                    <span className="uptime">Uptime</span>
                    <span className="security_metric">Security Metric</span>
                </ListGroup.Item>);
            this.setState({nodes: updatedNodes });
            }
        });
    }

    render() {
        return (
            <div className='list'>
                <div className='list_inner'>
                    <MDBContainer>
                        <div className="scrollbar scrollbar-primary  mt-5 mx-auto">
                            <ListGroup className='list_group'>
                                {this.state.nodes}
                            </ListGroup>
                        </div>
                    </MDBContainer>
                </div>
            </div>
        )
    }
}
