import logo from './logo.svg';
import React from 'react';
import './App.css';
import DashboardList from "./components/DashboardList";
import DashboardChart from "./components/DashboardChart";
import TopMap from "./components/TopMap";
import DashboardNavbar from "./components/DashboardNavbar";
import axios from 'axios';

let data = [];
function getData() {
  return axios.get("http://localhost:8080/get-all-nodes").then(response => {
    console.log(response.data);
    return response.data;
    // console.log(data);
    // return response.data;
  });
}

function App() {
  return (
    <div className="App">

      <main className='main'>
        <DashboardNavbar />
        <div className='test'>
        <TopMap />
        </div>
        <DashboardChart />
      </main>
        <DashboardList data = {getData()}/>
    </div>
  );
}

export default App;
