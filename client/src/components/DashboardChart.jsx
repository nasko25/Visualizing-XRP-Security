import { Component } from "react";
import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const data = [];
for (let i=1; i<=30; i++) {
    data.push({name: "Day " + i, security: 50});
}

export default class DashboardChart extends Component {
    render() {
        return (
            <div className='chart'>
                <LineChart className ='linechart' width={600} height={300} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <Line type="monotone" dataKey="security" stroke="#8884d8" />
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                </LineChart>
            </div>
        )
    }
}