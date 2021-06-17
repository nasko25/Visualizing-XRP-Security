import { Grommet, Header, Grid, Box, Heading, DataChart, DataTable, List, Text } from "grommet";
import { Component } from "react";
import NavigationBar from "../NavigationBar";
import { History } from 'history';
import { HistoricalScore } from './../node-page/NodePageTypes';
import axios from 'axios';
import { SETUP, COLORS } from "../../style/constants";
import HistoricalChart from "../HistoricalChart";

export type ValidatorPageMainProps = {
    history: History;
}

export type ValidatorInfo = {
    public_key: string,
    score: number,
    history: HistoricalScore[]
}

export type Validator = {
    history: ValidatorHistory[],
    public_key: string,
    score: string,
    timestamp: string
}

export type ValidatorHistory = {
    timestamp: string,
    score: number
}

export type ValidatorPageMainStats = {
    data: Validator[],
    info: ValidatorInfo,
    selected: string
}

export default class ValidatorPageMain extends Component<ValidatorPageMainProps, ValidatorPageMainStats> {

    constructor(props: ValidatorPageMainProps) {
        super(props);
        this.state = {
            data: [], 
            info: {
                public_key: "Please select a node",
                score: 0.0,
                history: [{
                    date: '0-0-0',
                    score: 0,
                }]
            },
            selected: ''
        }
    }

    componentDidMount() {
        this.getData();
    }

    // componentDidUpdate(prevProps: ValidatorPageMainProps, prevState: ValidatorPageMainStats, some: any) {
    //     this.chart(this.state.selected);
    // }

    // getNodeInfo() {
    //     var history: HistoricalScore[] = [];

    //     {/* Add requests to API for validator node info*/}
    //     this.getData();
    
    // }
    
    /**
     * Sends a HTTP get request to the server to get information about the validator nodes
     * @returns A promise
     */
    getData() {
        return axios.get("http://" + window.location.hostname + ":8080/validator/get-all-validators").then( (response) => {
            this.setState({data: response.data});
            console.log(response.data);
        });
    }

    /**
     * Gets the information for the selected node
     * @param pub_key The public key of the selected node
     * @returns The selected validator node
     */
    getInfo(pub_key: string): Validator[] {
        // let h: HistoricalScore[] | null = null;
        // for (let node of this.state.data) {
        //     if (node.public_key === pub_key) {
        //         console.log("PUBLIC KEY FOUND");
        //         console.log(node);

        //         let h: HistoricalScore[] = node.history.map((h) => {
        //             let n: HistoricalScore = {
        //                 score: parseFloat(h.score.toFixed(2)),
        //                 date: String(h.timestamp).slice(0, 10),
        //             }
        //             return n;
        //         });

        //         this.setState({info: {
        //             public_key: node.public_key,
        //             score: parseFloat(parseFloat(node.score).toFixed(2)),
        //             history: h
        //         }});

        //         break;
        //     }
        // }

        // return h;

        return this.state.data.filter(node => {
            if (node.public_key === pub_key) {
                console.log("PUBLIC KEY FOUND");
                console.log(node);

                let h = node.history.map((h) => {
                    let n: HistoricalScore = {
                        score: parseFloat(h.score.toFixed(2)),
                        date: String(h.timestamp).slice(0, 10),
                    }
                    return n;
                });

                this.setState({info: {
                    public_key: node.public_key,
                    score: parseFloat(parseFloat(node.score).toFixed(2)),
                    history: h
                }});

                return node;
            }
        });
        // console.log(this.state.info);
    }

    chart(pub_key: string): HistoricalScore[] {

        let v: Validator = this.getInfo(pub_key)[0];
        let h: HistoricalScore[] = v.history.map((h) => {
                        let n: HistoricalScore = {
                            score: parseFloat(h.score.toFixed(2)),
                            date: String(h.timestamp).slice(0, 10),
                        }
                        return n;
                    });
        // console.log("HERE")
        // console.log(this.state.info)
        return h;
    }

    updateInfo(pub_key: string) {
        let node: Validator = this.state.data.filter(node => node.public_key === pub_key)[0]
 
        console.log("PUBLIC KEY FOUND");
        console.log(node);

                let h = node.history.map((h) => {
                    let n: HistoricalScore = {
                        score: h.score,
                        date: String(h.timestamp).slice(0, 10),
                    }
                    return n;
                });

                console.log("HISTORY")
                console.log(h)
                
                if (h !== undefined) {
                    console.log("History is not undefined");
                    this.setState({info: {
                        public_key: node.public_key,
                        score: parseFloat(parseFloat(node.score).toFixed(2)),
                        history: this.state.info.history
                    }});
                } else {
                    console.log("History is undefined");
                    this.setState({info: {
                        public_key: node.public_key,
                        score: parseFloat(parseFloat(node.score).toFixed(2)),
                        history: [{
                            score: 0,
                            date: '0-0-0'
                        }]
                    }});
                }

                return node;
            
    }

    render() {
        return(
            <Grommet style={{height: '100%', width: '100%'}}>
                <Header style={{width: '100%', height: `${SETUP.header_height}%`, backgroundColor: COLORS.nav}}>
                    <NavigationBar title="Validators"></NavigationBar>
                </Header>

                <div className='ValidatorPageMain' style={{width: '100%', height: `${100 - SETUP.header_height}%`}}>
                    <Grid 
                        rows={["1/2", "1/2"]}
                        columns={["1/2", "1/2"]}
                        areas={[
                            { name: 'info', start: [1, 0], end: [1, 0] },
                            { name: 'list', start: [0, 0], end: [0, 1] },
                            { name: 'chart', start: [1, 1], end: [1, 1] },
                        ]}
                        style={{width: '100%', height: '100%'}}
                        >
                        <Box round="1%" margin={{ top: "2%", left: "1%", right: "2%", bottom: "1%" }} gridArea="info" background={COLORS.main}>
                            <Heading size="100%" margin="3%">{this.state.info.public_key}</Heading>
                            <List
                                style={{ width: "70%", height: "70%", alignSelf: "center" }}

                                primaryKey="name"
                                secondaryKey="value"

                                data={[
                                    { name: 'Public Key', value: this.state.info.public_key },
                                    { name: 'Agreemnet Score', value: this.state.info.score },
                                ]}
                            />
                        </Box>
                        <Box round="1%" margin={{ top: "2%", left: "2%", right: "1%", bottom: "2%" }} gridArea="list" background={COLORS.main}>
                            <Heading size="100%" margin="2%">Validator List</Heading>
                            <Box
                                // className="scrollbar-hidden"
                                overflow="auto"
                                style={{ height: "80%" }}
                                margin="2%"
                                round="1%"
                                background={COLORS.button}
                            >
                                <DataTable
                                    columns={[
                                        {
                                            property: 'public_key',
                                            header: <Text><b>Public Key</b></Text>,
                                            size: '100%',
                                            search: true,
                                            primary: true,
                                            align: 'center'
                                        }
                                    ]}
                                
                                    data={this.state.data}
                                    step={10}
                                    size='large'
                                    onClickRow={({datum}) => {
                                        console.log(datum.public_key);
                                        this.updateInfo(datum.public_key);
                                        // this.setState({selected: datum.public_key});
                                    }}
                                    pad= {{
                                        horizontal: "medium",
                                        vertical: "xsmall"
                                    }}
                                    style={{scrollbarWidth: 'none', height: '100%', userSelect: 'none'}}
                                    border={{
                                        color: 'white',
                                        side: 'bottom',
                                        size: '1px',
                                    }}
                                />
                            </Box>
                        </Box>
                        <Box round="1%" pad={{ left: "5%", right: "5%" }} justify="center" margin={{ top: "1%", left: "1%", right: "2%", bottom: "2%" }} gridArea="chart" background={COLORS.main} color="hd_bgnd">
                            <Heading size="100%" margin="2%">Score over Time</Heading>
                            {/* <HistoricalChart historical_scores={this.chart(this.state.selected)}/> */}
                            <HistoricalChart historical_scores={this.state.info.history}/>
                        </Box>
                    </Grid>
                </div>
            </Grommet>
        );
    }
}