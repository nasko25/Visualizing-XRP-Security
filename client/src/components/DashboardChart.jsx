import { Component } from "react";
import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const data = [];
for (let i=1; i<=30; i++) {
    data.push({name: "Day " + i, security: 50});
}

// Hardcoded example node security history for visual purposes
// Will be removed once the website is fully functional

data[3] = {name: "Day 3", security: 25};
data[5] = {name: "Day 5", security: 60};
data[7] = {name: "Day 7", security: 84};
data[10] = {name: "Day 10", security: 92};
data[11] = {name: "Day 11", security: 100};

for (let i=12; i<=19; i++) {
    data[i] = {name: "Day " + i, security: 100};
}

data[20] = {name: "Day 20", security: 97};
data[21] = {name: "Day 21", security: 100};
data[23] = {name: "Day 23", security: 100};

for (let i=24; i<=30; i++) {
    data[i] = {name: "Day " + i, security: 0};
}

export default class DashboardChart extends Component {
    render() {
        return (
            <div className='chart'>
                <LineChart className ='linechart' width={1800} height={400} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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