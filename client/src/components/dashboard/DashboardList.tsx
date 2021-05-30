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

            <div className='table-outer'>
                <Grommet style={{color: 'white', height: '100%', maxWidth: '100%'}}>
                    <Box style={{height: '100%', width: '100%'}}>
                        <DataTable 
                            columns={[
                                {
                                    property: 'public_key',
                                    header: <Text><b>Public Key</b></Text>,
                                    size: '50%',
                                    search: true
                                },
                                {
                                    property: 'rippled_version',
                                    header: <Text><b>Version</b></Text>,
                                    size: '15%'
                                },
                                {
                                    property: 'uptime',
                                    header: <Text><b>Uptime</b></Text>,
                                    size: '10%',
                                    align: 'start'
                                },
                                {
                                    property: 'trustScore',
                                    header: <Text><b>Trust Score</b></Text>,
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
                            pad= {{
                                horizontal: "medium",
                                vertical: "xsmall"
                            }}
                            style={{scrollbarWidth: 'none', height: '100%'}}
                            background={{
                                "body": ["#333333", "#3f3f3f"]
                                }
                              }
                        />
                    </Box>
                </Grommet>
            </div>

        )
    }
}
