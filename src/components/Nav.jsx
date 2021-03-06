// @flow
import React from 'react';
import '../css/Nav.css';
import type { Node } from 'react';

function Nav(): Node {
  return (
    <div className="nav">
      <a href="https://pineapple.lol">
        <img src="./images/pineapplelol.png" alt="pineapplelol logo" />
      </a>
    </div>
  );
}

export default Nav;
