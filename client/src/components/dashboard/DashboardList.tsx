import { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'
import { Grommet, DataTable, Text, Box} from "grommet";
import Button from 'react-bootstrap/Button'
import { Link } from "react-router-dom";

export type DashboardListProps = {
    arrNodesData: Array<any>,
    selected: string,
    history: any
}

export default class DashboardList extends Component<DashboardListProps> {

    render() {
        let nodes = this.props.arrNodesData;
        if (this.props.selected != "") {
            let temp = [this.props.arrNodesData.find(node => node.public_key == this.props.selected)]
            nodes = temp.concat(nodes.filter(n => {
                if (n.public_key != temp[0].public_key) {
                    return n;
                }
            }))
        }

        return (

            <div className='table-group'>
                <Grommet style={{color: 'white', maxHeight: '100%', maxWidth: '100%'}}>
                    <Box style={{}}>
                        <DataTable
                            columns={[
                                {
                                    property: 'public_key',
                                    header: <Text>Public Key</Text>,
                                    size: '50%',
                                    search: true
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
                            // data={this.props.arrNodesData.filter(node => {
                            //     if (this.props.selected == "") {
                            //         return node;
                            //     } else {
                            //         if (node.public_key == this.props.selected) {
                            //             return node;
                            //         }
                            //     }
                            // })}
                            data={nodes}
                            step={10}
                            size='large'
                            // onSearch={this.highlightInList}
                            onClickRow={({datum}) => {
                                console.log(datum.public_key);
                                this.props.history.push("/node");
                            }}
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
                </div>
            </div>

        )
    }
}
