import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import Dashboard from "./components/dashboard/Dashboard";
import NodePageMain from './components/node-page/NodePageMain';
import AboutPageMain from './components/about-page/AboutPageMain'

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
        <Route exact path="/about" component={AboutPageMain}/>
      </main>
    </div>
    </BrowserRouter>
  );
}

export default App;
