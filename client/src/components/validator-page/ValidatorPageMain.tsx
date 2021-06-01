import { Grommet, Header, Grid, Box, Heading, DataChart } from "grommet";
import { Component } from "react";
import ValidatorPageNav, { ValidatorPageNavProps } from './ValidatorPageNav';
import { History } from 'history';
import { HistoricalScore } from './../node-page/NodePageTypes';


var SETUP = {
    header_height: 7.5,
    hd_bgnd: '#C3C3C3',
}

var COLORS = {
    main: "#383838",
    button: "#212529",
    nav: "#1a1a1a"
}

export type ValidatorPageMainProps = {
    history: History;
}

export type ValidatorPageMainStats = {
    historical_scores: HistoricalScore[]
}

export default class ValidatorPageMain extends Component<ValidatorPageMainProps, ValidatorPageMainStats> {

    constructor(props: ValidatorPageMainProps) {
        super(props);
        this.state = { 
            historical_scores: []
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

    createDataChart() {
        return (
            <DataChart
                data={this.state.historical_scores}
                series={['date', { property: 'score' }]}
                chart={[
                    { property: 'score', type: 'line', opacity: 'medium', thickness: '5%' },
                    { property: 'score', type: 'point', point: 'diamond', thickness: '10%' }
                ]}
                guide={{ x: { granularity: 'fine' }, y: { granularity: 'fine' } }}
                size={{ width: "fill" }}
                axis={{ x: { granularity: "medium" }, y: { granularity: "fine" } }}
                legend
                detail
            />
        );
    };

    render() {
        return(
            <Grommet style={{height: '100%', width: '100%'}}>
                <Header style={{width: '100%', height: `${SETUP.header_height}%`, backgroundColor: COLORS.nav}}>
                    <ValidatorPageNav history={this.props.history}/>
                </Header>

                <div className='ValidatorPageMain' style={{width: '100%', height: `${100 - SETUP.header_height}%`}}>
                    <Grid 
                        rows={["1/2", "1/2"]}
                        columns={["1/2", "1/2"]}
                        areas={[
                            { name: 'no-idea', start: [1, 0], end: [1, 0] },
                            { name: 'stats', start: [0, 0], end: [0, 1] },
                            { name: 'chart', start: [1, 1], end: [1, 1] },
                        ]}
                        style={{width: '100%', height: '100%'}}
                        >
                        <Box round="1%" margin={{ top: "2%", left: "1%", right: "2%", bottom: "1%" }} gridArea="no-idea" background={COLORS.main}>
                            {/* Insert something here*/}
                        </Box>
                        <Box round="1%" margin={{ top: "2%", left: "2%", right: "1%", bottom: "2%" }} gridArea="stats" background={COLORS.main}>
                            <Heading size="100%" margin="3%">Public key of Validator</Heading>
                            
                            <Heading size="100%" margin="2%">Validator List</Heading>
                            <Box
                                className="scrollbar-hidden"
                                overflow="auto"
                                style={{ height: "50%" }}
                                margin="2%"
                                round="1%"
                                background={COLORS.button}
                            >
                                {/* Insert list here*/}    
                            </Box>
                        </Box>
                        <Box round="1%" pad={{ left: "5%", right: "5%" }} justify="center" margin={{ top: "1%", left: "1%", right: "2%", bottom: "2%" }} gridArea="chart" background={COLORS.main} color="hd_bgnd">
                            <Heading size="100%" margin="2%">Score over Time</Heading>
                            {this.createDataChart()}
                        </Box>
                    </Grid>
                </div>
            </Grommet>
        );
    }
}