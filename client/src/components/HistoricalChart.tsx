import { Component } from 'react';
import { DataChart, Box } from 'grommet';
import { HistoricalScore } from '../components/node-page/NodePageTypes';

type HistoricalChartProps = {
    historical_scores: HistoricalScore[]
}

export default class HistoricalChart extends Component<HistoricalChartProps> {

    render() {
        return (
            <Box style={{ width: "100%", height: "80%" }}>
                <DataChart
                    data={this.props.historical_scores}
                    series={['date', 'score']}
                    chart={[
                        { property: 'score', type: 'line', opacity: 'medium', thickness: '5%' },
                        { property: 'score', type: 'point', point: 'diamond', thickness: '10%' }
                    ]}
                    guide={{ x: { granularity: 'fine' }, y: { granularity: 'fine' } }}
                    size={{ width: "fill", height: "fill" }}

                    axis={{ x: { granularity: "medium" }, y: { granularity: "fine" } }}
                    detail
                    gap='0px'
                />
            </Box>
        );
    }

}