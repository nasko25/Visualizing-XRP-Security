import logo from './logo.svg';
import React from 'react';
import './App.css';
import DashboardList from "./components/DashboardList";
import DashboardChart from "./components/DashboardChart";

function App() {
  return (
    <div className="App">
      
      <main>
        <DashboardList />
        <DashboardChart />
      </main>
    </div>
  );
}

export default App;
