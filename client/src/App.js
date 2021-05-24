import React from 'react';
import './App.css';
import Dashboard from "./components/Dashboard";
import NodePageMain from './components/node-page/NodePageMain';

function App() {
  return (
    <div className="App">

      <main className='main'>
        <Dashboard/>
      </main>
    </div>
  );
}

export default App;
