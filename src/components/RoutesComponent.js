import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import MultipleTest from "../pages/MultipleTest";
import Settings from "../pages/Settings";
import Home from "../pages/Home";
import Login from "../pages/Login";
import SignIn from "../pages/SignIn";
import EmailsList from "../pages/EmailsList";
import ReactGA from "react-ga4";

ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_ID);

function RoutesComponent() {
  useEffect(() => {
    ReactGA.send("pageview", window.location.pathname + window.location.search);
  }, []);

  return (
    <>
      <Routes>
        <Route path="*" element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/multiple" element={<MultipleTest />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkList" element={<EmailsList />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </>
  );
}

export default RoutesComponent;
