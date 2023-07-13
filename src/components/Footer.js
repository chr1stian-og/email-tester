import React, { Component, useEffect } from "react";
import { Helmet } from "react-helmet";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* <div className="flex justify-center"> */}
      <div className="absolute bottom-4 left-4">
        <h1 className="mix-blend-overlay text-white">
          © Christian MacArthur, {currentYear}
        </h1>
        {/*COUNTER CODE*/}
        {/* <Helmet>
          <script
            type="text/javascript"
            src="https://www.whomania.com/count/crga"
          ></script>
          <a href="https://www.versicherungen.at/">Versicherungsvergleich</a>
          <script
            type="text/javascript"
            src="https://www.whomania.com/ctr?id=0ba55f52f908e1bc65094756891c16c662666054"
          ></script>
        </Helmet> */}
      </div>
      {/* </div> */}
    </>
  );
}

export default Footer;
