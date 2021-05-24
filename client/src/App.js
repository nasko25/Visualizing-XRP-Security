import React from 'react';
import './App.css';
import Dashboard from "./components/dashboard/Dashboard";
import NodePageMain from './components/node-page/NodePageMain';

function App() {
  return (
    <div className="App">

      <main className='main'>
        <NodePageMain/>
      </main>
    </div>
  );
}

export default App;
