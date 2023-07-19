//for all browsers support
import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import "proxy-polyfill";

// Rest of your React app code
//for all browsers supportp

import "core-js/stable";
import "indexeddb-getall-shim";
import "regenerator-runtime/runtime";

import ReactGA from "react-ga4";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_ID);

const rootElement = document.getElementById("root");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
