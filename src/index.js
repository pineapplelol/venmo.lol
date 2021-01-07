import React from 'react';
import ReactDOM from 'react-dom';
import { Route, BrowserRouter as Router } from 'react-router-dom';

import Home from './pages/Home';
import UserGraph from './pages/UserGraph';

import 'antd/dist/antd.css';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Route path="/" exact component={Home} />
      <Route
        path="/:username"
        render={props => <UserGraph pageUser={props.match.params.username} />}
      />
    </Router>
  </React.StrictMode>,
  document.getElementById('root'),
);
