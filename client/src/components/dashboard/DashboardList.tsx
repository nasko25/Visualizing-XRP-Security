import { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'
import { Grommet, DataTable, Text, Box} from "grommet";
import { History } from 'history';
import { humanizeUptime } from '../../helper';

/**
 * Props passed down by parent component
 */
export type DashboardListProps = {
    arrNodesData: Array<any>,
    selected: string,
    history: History
}

/**
 * A component that visualizes the list on the Stock Dashboard Page
 * It contains a DataTable with the fields public_key, rippled_version,
 * uptime and security_score.
 */
export default class DashboardList extends Component<DashboardListProps> {
    highlight = {};

    /**
     * If a node on the map has been selected then said node is higlighted in the list
     * @returns An array containing all nodes and the selected one at the beginning
     */
    select() {
        let nodes = this.props.arrNodesData;
        let selected: string = this.props.selected;

        var jsonVariable: any = {};
        jsonVariable[selected] = {background: 'white'}
        this.highlight = jsonVariable;

        // Check if a node on the map has been selected and highlight it in the list
        if (selected !== "") {
            let temp = [this.props.arrNodesData.find(node => node.public_key === selected)]
            nodes = temp.concat(nodes.filter(n => {
                if (n.public_key !== temp[0].public_key) {
                    return n;
                }
            }));
        }
        return nodes;
    }

    render() {
        let nodes = this.select();
        return (
            <div className='table-outer'>
                <Grommet style={{color: 'white', height: '100%', maxWidth: '100%'}}>
                    <Box style={{height: '100%', width: '100%'}}>
                        <DataTable
                            columns={[
                                {
                                    property: 'public_key',
                                    header: <Text><b>Public Key</b></Text>,
                                    size: '45%',
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
                                    size: '25%',
                                    align: 'start',
                                    sortable: true
                                },
                                {
                                    property: 'security_score',
                                    header: <Text><b>Security Score</b></Text>,
                                    size: '15%',
                                    align: 'start'
                                }
                            ]}
                            data={nodes.map(node => ({
                                public_key: node.public_key,
                                rippled_version: node.rippled_version,
                                uptime: humanizeUptime(node.uptime),
                                security_score: node.trust_score
                            }))}
                            step={10}
                            size='large'
                            onClickRow={({datum}) => {
                                // console.log(datum.public_key);
                                this.props.history.push("/node?public_key=" + datum.public_key);
                            }}
                            pad= {{
                                horizontal: "medium",
                                vertical: "xsmall"
                            }}
                            style={{scrollbarWidth: 'none', height: '100%', userSelect: 'none'}}
                            rowProps= { this.highlight }
                            border={{
                                color: 'white',
                                side: 'bottom',
                                size: '1px',
                            }}
                            data-testid='dashboard-list'
                        />
                    </Box>
                </Grommet>
            </div>

        )
    }
}
