import React from "react";
import ReactDOM from "react-dom";
import { Route, BrowserRouter as Router } from "react-router-dom";

import "antd/dist/antd.css";
import "./index.css";
import Home from "./pages/Home";
import UserGraph from "./pages/UserGraph";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Route path="/" exact component={Home} />
      <Route path="/:id" render={(props) => <UserGraph {...props} />} />
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
