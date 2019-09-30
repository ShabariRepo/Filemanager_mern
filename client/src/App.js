import React from 'react';
import { Route, Switch, Link } from "react-router-dom";
import "semantic-ui-css/semantic.min.css";

import {
  Divider,
  Grid,
  Input,
  Menu,
} from "semantic-ui-react";
import "./App.css";

import UploadForm from './Components/Upload';
import Dashboard from './Components/Dashboard';
import File from './Components/FileView';


function App() {
  return (
    <div className="App">
        <Grid padded className="tablet computer only">
          <Menu borderless inverted fluid fixed="top">
            <Menu.Item header as={Link} to="/">
              CL File Repository
            </Menu.Item>
            <Menu.Menu position="right">
              <Menu.Item>
                <Input placeholder="Search..." size="small" />
              </Menu.Item>
              <Menu.Item as={Link} to="/">Dashboard</Menu.Item>
              <Menu.Item as="a">Settings</Menu.Item>
              <Menu.Item as="a">Profile</Menu.Item>
              <Menu.Item as="a">Help</Menu.Item>
            </Menu.Menu>
          </Menu>
        </Grid>
        <Grid padded>
          <Grid.Column
            tablet={3}
            computer={3}
            only="tablet computer"
            id="sidebar"
          >
            <Menu vertical borderless fluid text>
              <Menu.Item as={Link} to="/">Overview</Menu.Item>
              {/* <NavLink to="/upload">Upload</NavLink> */}
              <Menu.Item as={Link} to="/upload">Upload</Menu.Item>
              <Divider hidden />
              <Menu.Item as="a">Reports (coming soon..)</Menu.Item>
              <Menu.Item as="a">Analytics (coming soon..)</Menu.Item>
              <Menu.Item as="a">Export (coming soon..)</Menu.Item>
              {/* <Divider hidden />
              <Menu.Item as="a">Nav item (coming soon..)</Menu.Item>
              <Menu.Item as="a">Nav item again (coming soon..)</Menu.Item>
              <Menu.Item as="a">One more nav (coming soon..)</Menu.Item>
              <Menu.Item as="a">Another nav item (coming soon..)</Menu.Item>
              <Menu.Item as="a">More navigation (coming soon..)</Menu.Item>
              <Divider hidden />
              <Menu.Item as="a">Macintoch (coming soon..)</Menu.Item>
              <Menu.Item as="a">Linux (coming soon..)</Menu.Item>
              <Menu.Item as="a">Windows (coming soon..)</Menu.Item> */}
            </Menu>
          </Grid.Column>
          <Grid.Column
            mobile={16}
            tablet={13}
            computer={13}
            floated="right"
            id="content"
          >
            <Switch>
            {/* <Dashboard /> */}
            <Route exact path="/" component={Dashboard} />
            <Route path="/upload" component={UploadForm} />
            <Route path="/file" component={File} />
          </Switch>
          </Grid.Column>
        </Grid>
      </div>
    );
}

// function Home() {
//   return <Dashboard />;
// }

// function Upload() {
//   return <UploadForm />;
// }

// function Topic({ match }) {
//   return <h3>Requested Param: {match.params.id}</h3>;
// }

// function Topics({ match }) {
//   return (
//     <div>
//       <h2>Topics</h2>

//       <ul>
//         <li>
//           <Link to={`${match.url}/components`}>Components</Link>
//         </li>
//         <li>
//           <Link to={`${match.url}/props-v-state`}>Props v. State</Link>
//         </li>
//       </ul>

//       <Route path={`${match.path}/:id`} component={Topic} />
//       <Route
//         exact
//         path={match.path}
//         render={() => <h3>Please select a topic.</h3>}
//       />
//     </div>
//   );
// }

// function Header() {
//   return (
//     <ul>
//       <li>
//         <Link to="/">Home</Link>
//       </li>
//       <li>
//         <Link to="/upload">Upload</Link>
//       </li>
//       <li>
//         <Link to="/topics">Topics</Link>
//       </li>
//     </ul>
//   );
// }

export default App;