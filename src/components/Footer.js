import React from 'react';

import '../css/Footer.css';

function Footer() {
  return (
    <div className="footer">
      <div className="copyright">Copyright &#169; 2020 pineapplelol</div>
      <a href="https://vercel.com?utm_source=pineapplelol&utm_campaign=oss">
        <img src="/powered-by-vercel.svg" alt="vercel" />
      </a>
    </div>
  );
}

export default Footer;
