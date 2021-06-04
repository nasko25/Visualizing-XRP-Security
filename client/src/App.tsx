import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import Dashboard from "./components/dashboard/Dashboard";
import NodePageMain from './components/node-page/NodePageMain';
import ValidatorPageMain from './components/validator-page/ValidatorPageMain';

function App() {
  return (
    <BrowserRouter>
    <div className="App">

      <main className='main'>
        {/* <Route exact path="/" component={Dashboard}/> */}
        <Route exact path="/" render={(props) => 
            <Dashboard history={props.history}/>
        }/>
        <Route exact path="/node" component={NodePageMain}/>
        <Route exact path="/validators" component={ValidatorPageMain}></Route>
      </main>
    </div>
    </BrowserRouter>
  );
}

export default App;
