// @flow
import React from 'react';
import { Input } from 'antd';
import { useHistory } from 'react-router-dom';

import Nav from '../components/Nav';
import Footer from '../components/Footer';
import '../css/Home.css';

const { Search } = Input;

function Home() {
  const history = useHistory();

  return (
    <div className="landing">
      <Nav />
      <div className="landing-content">
        <div className="landing-text">
          <h1>Explore</h1>
          <h2>your Venmo network.</h2>
          <p>Enter a username to explore their payment network.</p>
          <Search
            placeholder="Venmo username"
            onSearch={(value) => {
              history.push(`/${value}`);
            }}
            size="large"
            enterButton
          />
        </div>
        <div className="landing-img">
          <img src="./images/space.svg" alt="space" />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
