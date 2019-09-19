import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";

import UploadForm from './Components/Upload';
import Dashboard from './Components/Dashboard';


function App() {
  return (
    //     <Router className="App">
    //       <div>
    //         <Dashboard />
    // {/* 
    //         <Route exact path="/" component={Home} />
    //         <Route path="/upload" component={Upload} />
    //         <Route path="/topics" component={Topics} /> */}
    //       </div>
    //     </Router>
    <div className="App">
      {/* <Router>
        <div> */}
          <Dashboard />

          {/* <Switch> */}
            {/* <Route exact path="/" component={Dashboard} /> */}
            {/* <Route path="/upload" component={withRouter(Upload)} /> */}
          {/* </Switch> */}
          {/* <Route path="/topics" component={Topics} /> */}
        {/* </div>
      </Router> */}
    </div>
  );
}

function Home() {
  return <Dashboard />;
}

function Upload() {
  return <UploadForm />;
}

function Topic({ match }) {
  return <h3>Requested Param: {match.params.id}</h3>;
}

function Topics({ match }) {
  return (
    <div>
      <h2>Topics</h2>

      <ul>
        <li>
          <Link to={`${match.url}/components`}>Components</Link>
        </li>
        <li>
          <Link to={`${match.url}/props-v-state`}>Props v. State</Link>
        </li>
      </ul>

      <Route path={`${match.path}/:id`} component={Topic} />
      <Route
        exact
        path={match.path}
        render={() => <h3>Please select a topic.</h3>}
      />
    </div>
  );
}

function Header() {
  return (
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/upload">Upload</Link>
      </li>
      <li>
        <Link to="/topics">Topics</Link>
      </li>
    </ul>
  );
}

export default App;