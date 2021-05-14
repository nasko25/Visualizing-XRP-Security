import logo from './logo.svg';
import React from 'react';
import './App.css';
import DashboardList from "./components/DashboardList";
import DashboardChart from "./components/DashboardChart";
import TopMap from "./components/TopMap";
import DashboardNavbar from "./components/DashboardNavbar";
import axios from 'axios';

// let data = [];
// async function getData () {
//   await axios.get("http://localhost:8080/get-all-nodes").then(response => {
//     console.log(response);
//   });
// }


function App() {
  return (
    <div className="App">
      
      <main className='main'>
        <DashboardNavbar />
        <div className='test'>
        <TopMap />
        <DashboardList />
        </div>
        <DashboardChart />
      </main>
    </div>
  );
}

export default App;
