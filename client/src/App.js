import React from 'react';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import Dashboard from "./components/dashboard/Dashboard";
import NodePageMain from './components/node-page/NodePageMain';

function App() {
  return (
    <BrowserRouter>
    <div className="App">

      <main className='main'>
        <Route exact path="/" component={Dashboard}/>
        <Route exact path="/node" component={NodePageMain}/>
      </main>
    </div>
    </BrowserRouter>
  );
}

export default App;
