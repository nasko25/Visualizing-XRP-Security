import logo from './logo.svg';
import React from 'react';
import './App.css';
import DashboardList from "./components/DashboardList";
import DashboardChart from "./components/DashboardChart";
import TopMap from "./components/TopMap";
import DashboardNavbar from "./components/DashboardNavbar";
import axios from 'axios';

let data = [];
async function getData () {
  return await axios.get("http://localhost:8080/get-all-nodes").then(response => {
    return response.data;
    // console.log(data);
    // return response.data;
  });
}

function App() {
  // getData();
  return (
    <div className="App">

      <main className='main'>
        <DashboardNavbar />
        <div className='test'>
        <TopMap />
        <DashboardList data = {getData()}/>
        </div>
        <DashboardChart />
      </main>
    </div>
  );
}

export default App;
