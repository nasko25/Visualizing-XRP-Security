import { Component } from "react";
import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import 'bootstrap/dist/css/bootstrap.min.css'
import { MDBContainer } from 'mdbreact';

export default class DashboardList extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className='list'>
                <div className='list_inner'>
                    <MDBContainer>
                    <div className="scrollbar scrollbar-primary  mt-5 mx-auto">
                    <ListGroup>
                        <ListGroup.Item>
                        <span class="ip">IP</span>
                            <span class="version">Version</span>
                            <span class="public_key">Public Key</span>
                            <span class="uptime">Uptime</span>
                            <span class="security_metric">Security Metric</span>
                        </ListGroup.Item>
                        <ListGroup.Item>
                        <span class="ip">IP</span>
                            <span class="version">Version</span>
                            <span class="public_key">Public Key</span>
                            <span class="uptime">Uptime</span>
                            <span class="security_metric">Security Metric</span>
                        </ListGroup.Item>
                        <ListGroup.Item>
                        <span class="ip">IP</span>
                            <span class="version">Version</span>
                            <span class="public_key">Public Key</span>
                            <span class="uptime">Uptime</span>
                            <span class="security_metric">Security Metric</span>
                        </ListGroup.Item>
                        <ListGroup.Item>
                        <span class="ip">IP</span>
                            <span class="version">Version</span>
                            <span class="public_key">Public Key</span>
                            <span class="uptime">Uptime</span>
                            <span class="security_metric">Security Metric</span>
                        </ListGroup.Item>
                        <ListGroup.Item>
                        <span class="ip">IP</span>
                            <span class="version">Version</span>
                            <span class="public_key">Public Key</span>
                            <span class="uptime">Uptime</span>
                            <span class="security_metric">Security Metric</span>
                        </ListGroup.Item>
                        <ListGroup.Item>
                        <span class="ip">IP</span>
                            <span class="version">Version</span>
                            <span class="public_key">Public Key</span>
                            <span class="uptime">Uptime</span>
                            <span class="security_metric">Security Metric</span>
                        </ListGroup.Item>
                        <ListGroup.Item>
                        <span class="ip">IP</span>
                            <span class="version">Version</span>
                            <span class="public_key">Public Key</span>
                            <span class="uptime">Uptime</span>
                            <span class="security_metric">Security Metric</span>
                        </ListGroup.Item>
                        <ListGroup.Item>
                        <span class="ip">IP</span>
                            <span class="version">Version</span>
                            <span class="public_key">Public Key</span>
                            <span class="uptime">Uptime</span>
                            <span class="security_metric">Security Metric</span>
                        </ListGroup.Item>
                        <ListGroup.Item>
                        <span class="ip">IP</span>
                            <span class="version">Version</span>
                            <span class="public_key">Public Key</span>
                            <span class="uptime">Uptime</span>
                            <span class="security_metric">Security Metric</span>
                        </ListGroup.Item>
                        <ListGroup.Item>
                        <span class="ip">IP</span>
                            <span class="version">Version</span>
                            <span class="public_key">Public Key</span>
                            <span class="uptime">Uptime</span>
                            <span class="security_metric">Security Metric</span>
                        </ListGroup.Item>
                        <ListGroup.Item>
                        <span class="ip">IP</span>
                            <span class="version">Version</span>
                            <span class="public_key">Public Key</span>
                            <span class="uptime">Uptime</span>
                            <span class="security_metric">Security Metric</span>
                        </ListGroup.Item>
                        <ListGroup.Item>
                        <span class="ip">IP</span>
                            <span class="version">Version</span>
                            <span class="public_key">Public Key</span>
                            <span class="uptime">Uptime</span>
                            <span class="security_metric">Security Metric</span>
                        </ListGroup.Item>
                    </ListGroup>
                    </div>
                    </MDBContainer>
                </div>
            </div>
        )
    }
}