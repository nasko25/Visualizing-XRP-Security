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

export type ValidatiorInfo = {
    public_key: string,
    domain: string,
    unl: boolean,
    agreement_score: number,
    total_validations: number,
    missed: number
}

export type ValidatorPageMainStats = {
    historical_scores: HistoricalScore[],
    info: ValidatiorInfo
}

export default class ValidatorPageMain extends Component<ValidatorPageMainProps, ValidatorPageMainStats> {

    constructor(props: ValidatorPageMainProps) {
        super(props);
        this.state = { 
            historical_scores: [],
            info: {
                public_key: "asnbujau418dabd1953na192n4",
                domain: "something.com",
                unl: true,
                agreement_score: 0.9,
                total_validations: 24000,
                missed: 2000
            },
        }
    }

    componentDidMount() {
        this.getNodeInfo();
    }

    getNodeInfo() {
        var history: HistoricalScore[] = [];
        for (var i = 1; i <= 30; i++) {
            history.push({ date: "2020-08-" + i, score: parseFloat(((Math.random() + 1) / 2).toFixed(3)) });
        }
        this.setState({ historical_scores: history });

        {/* Add requests to API for validator node info*/}
    
    }

    // TODO
    // Update setting state according to response once endpoint it implemented
    
    updateList(public_key: string) {
        return axios.get("http://localhost:8080/validator/info?public_key=" + public_key).then( (response) => {
            this.setState({info: response.data});
        });
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
                                    { name: 'Domain', value: this.state.info.domain },
                                    { name: 'UNL', value: this.state.info.unl ? "yes" : "no" },
                                    { name: 'Agreemnet Score', value: this.state.info.agreement_score },
                                    { name: 'Total Validations', value: this.state.info.total_validations },
                                    { name: 'Missed', value: this.state.info.missed },
                                ]}
                            />
                        </Box>
                        <Box round="1%" margin={{ top: "2%", left: "2%", right: "1%", bottom: "2%" }} gridArea="list" background={COLORS.main}>
                            <Heading size="100%" margin="2%">Validator List</Heading>
                            <Box
                                className="scrollbar-hidden"
                                overflow="auto"
                                style={{ height: "50%" }}
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
                                            primary: true
                                        }
                                    ]}
                                
                                    data={[
                                        {
                                            public_key: 'Key'
                                        },
                                        {
                                            public_key: 'Key'
                                        }, 
                                        {
                                            public_key: 'Key'
                                        }
                                    ]}
                                    step={10}
                                    size='large'
                                    onClickRow={({datum}) => {
                                        console.log(datum.public_key);
                                        // this.updateList(datum.public_key);
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
                            <HistoricalChart historical_scores={this.state.historical_scores}/>
                        </Box>
                    </Grid>
                </div>
            </Grommet>
        );
    }
}