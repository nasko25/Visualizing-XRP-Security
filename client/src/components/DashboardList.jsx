import { Component } from "react";
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import { Grommet, DataTable, Text, Box} from "grommet";
import Button from 'react-bootstrap/Button'

export default class DashboardList extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (

            <div className='table-group'>
                <Grommet style={{color: 'white', maxHeight: '80%', maxWidth: '100%'}}>
                    <Box style={{}}>
                    <DataTable
                        columns={[
                            {
                                property: 'public_key',
                                header: <Text>Public Key</Text>,
                                size: '50%'
                            },
                            {
                                property: 'rippled_version',
                                header: <Text>Version</Text>,
                                size: '15%'
                            },
                            {
                                property: 'uptime',
                                header: <Text>Uptime</Text>,
                                size: '10%',
                                align: 'start'
                            },
                            {
                                property: 'trustScore',
                                header: <Text>Trust Score</Text>,
                                size: '10%',
                                align: 'start'
                            }
                        ]}
                        data={this.props.data}
                        step='10'
                        size='large'
                    />
                    </Box>
                </Grommet>
                <div className='buttons'>
                    <div className='button-duo'>
                        <div className='button-stock'>
                        <Button variant="dark" size='lg'>Stock Nodes</Button>
                        </div>
                        <div className='button-validtor'>
                        <Button variant="dark" size='lg'>Validator Nodes</Button>
                        </div>
                    </div>
                    <div className='button-go-to'>
                    <Button variant="dark" size='lg'>Go To Node Page</Button>
                    </div>
                </div>
            </div>

        )
    }
}
