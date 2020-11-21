import React from "react";
import { Input } from "antd";

import Nav from "../components/Nav";
import "../css/Home.css";

const { Search } = Input;

function Home() {
  return (
    <div className="landing">
      <Nav />
      <div className="landing-content">
        <div className="landing-text">
          <h1>Discover</h1>
          <h2>your Venmo network.</h2>
          <p>Enter a username to learn about their payment network.</p>
          <Search
            placeholder="Venmo username"
            onSearch={(value) => {
              console.log(value);
            }}
            size="large"
            enterButton
          />
        </div>
        <div className="landing-img">
          <img src="./images/space.svg" alt="space" />
        </div>
      </div>
    </div>
  );
}

export default Home;
