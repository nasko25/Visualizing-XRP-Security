import { Component } from "react";
import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const data = [];
for (let i=1; i<=30; i++) {
    data.push({name: "Day " + i, trust_score: 50});
}

// Hardcoded example node security history for visual purposes
// Will be removed once the website is fully functional

data[2] = {name: "Day 3", trust_score: 25};
data[4] = {name: "Day 5", trust_score: 60};
data[6] = {name: "Day 7", trust_score: 84};
data[9] = {name: "Day 10", trust_score: 92};
data[10] = {name: "Day 11", trust_score: 100};

for (let i=11; i<=18; i++) {
    let day = i + 1;
    data[i] = {name: "Day " + day, trust_score: 100};
}

data[19] = {name: "Day 20", trust_score: 97};
data[20] = {name: "Day 21", trust_score: 100};
data[22] = {name: "Day 23", trust_score: 100};

for (let i=23; i<=28; i++) {
    let day = i + 1;
    data[i] = {name: "Day " + day, trust_score: 0};
}

data[29] = {name: "Day 30", trust_score: 50};

export default class DashboardChart extends Component {
    render() {
        return (
            <div className='chart'>
                <LineChart className ='linechart' width={1800} height={400} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <Line type="monotone" dataKey="trust_score" stroke="#8884d8" />
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                </LineChart>
            </div>
        )
    }
}