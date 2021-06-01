import { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'
import { Grommet, DataTable, Text, Box} from "grommet";
import { History } from 'history';

export type DashboardListProps = {
    arrNodesData: Array<any>,
    selected: string,
    history: History
}

export default class DashboardList extends Component<DashboardListProps> {
    highligth = {};

    test(){

    }
    render() {
        let nodes = this.props.arrNodesData;
        let selected: string = this.props.selected;

        var jsonVariable: any = {};
        jsonVariable[selected] = {background: 'white'}
        this.highligth = jsonVariable;

        if (selected != "") {
            let temp = [this.props.arrNodesData.find(node => node.public_key == selected)]
            nodes = temp.concat(nodes.filter(n => {
                if (n.public_key != temp[0].public_key) {
                    return n;
                }
            }));
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
                                    search: true,
                                    primary: true
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
                                    align: 'start',
                                    sortable: true
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
                                this.props.history.push("/node?public_key=" + datum.public_key);
                            }}
                            pad= {{
                                horizontal: "medium",
                                vertical: "xsmall"
                            }}
                            style={{scrollbarWidth: 'none', height: '100%'}}
                            // background={{
                            //     "body": ["#383838", "rgb(38,38,38)"]
                            //     }
                            //   }
                            // sort={({property: 'uptime', direction: 'desc'})}
                            rowProps= { this.highligth }
                            border={{
                                color: 'white',
                                side: 'bottom',
                                size: '1px',
                            }}
                        />
                    </Box>
                </Grommet>
            </div>

        )
    }
}
