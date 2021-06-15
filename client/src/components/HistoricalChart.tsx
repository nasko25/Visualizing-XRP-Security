import { Component } from 'react';
import { DataChart } from 'grommet';
import { HistoricalScore } from '../components/node-page/NodePageTypes';

type HistoricalChartProps = {
    historical_scores: HistoricalScore[]
}

export default class HistoricalChart extends Component<HistoricalChartProps> {

    render(){
        return (
            <DataChart
                data={this.props.historical_scores}
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
    }

}