import React from "react";

import "../css/Footer.css";

function Footer() {
  return (
    <div className="footer">
      <a href="https://vercel.com?utm_source=pineapplelol&utm_campaign=oss">
        <img
          src="./images/powered-by-vercel.svg"
          alt="vercel"
          className="vercel"
        />
      </a>
      <div className="footer-links">
        <ul>
          <li>
            <a href="https://pineapple.lol/">About</a>
          </li>
          <li>
            <a href="https://github.com/pineapplelol/venmo.lol">View Source</a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Footer;
