import React, { Component, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import { res } from "react-email-validator";

// const api = axios.create({ baseURL: "http://localhost:3001" });
const api = axios.create({ baseURL: "https://65.21.165.114:3001" });
const loading = require("../assets/loading.gif");

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [emails, setEmails] = useState(null);
  const [testedEmails, setTestedEmails] = useState(null);

  function getEmails() {
    try {
      if (emails === null || !isLoading) {
        setIsLoading(true);
        api.get("/getEmails").then((resp) => {
          setIsLoading(false);
          setEmails(resp.data);
          console.log(JSON.stringify(emails));
        });
      }
    } catch (err) {
      alert(
        "Error while fetching emails, make sure you have an internet connection"
      );
      console.log(
        "Error while fetching emails, make sure you have an internet connection",
        err
      );
    }
  }

  function testEmails() {
    try {
      if (testedEmails == null || !isLoading2) {
        setIsLoading2(true);
        api.get("/testEmails").then((resp) => {
          setIsLoading2(false);
          setTestedEmails(resp.data);
        });
      }
    } catch (err) {
      console.log("Error while testing emails \n", err);
    }
  }

  useEffect(() => {
    // {
    //   try {
    //     api.get("/getEmails").then((resp) => {
    //       console.log(resp.data);
    //       setEmails(resp.data);
    //     });
    //   } catch (err) {}
    // }
  }, []);

  return (
    <div className="h-screen overflow-y-hidden">
      <Navbar />
      {/* <h1 className="flex mt-10 text-[#ec1554] min-w-max font-bold text-3xl justify-center items-center align-center">
        Direct Test
      </h1> */}
      <h1 className="flex mt-10 text-[#ec1554] min-w-max font-bold text-3xl justify-center items-center align-center">
        Página em Manuntenção
      </h1>
      <div className="flex sm:flex-row mt-20 flex-col gap-2 items-center justify-center align-center">
        {/* <button
          id="test-button"
          onClick={getEmails}
          className={` ${
            !isLoading ? "btn btn-error w-fit" : "block"
          } duration-150 transition-all`}
        >
          <span className={`${!isLoading ? "block" : "hidden"}`}>FETCH </span>
          <img
            src={loading}
            className={`w-[30px] ${isLoading ? "block" : "hidden"}`}
          />
        </button> */}

        {/* <button
          id="test-button"
          onClick={testEmails}
          className={` ${
            !isLoading2 ? "btn btn-error w-fit" : "block"
          } duration-150 transition-all`}
        >
          <span className={`${!isLoading2 ? "block" : "hidden"}`}>TEST </span>
          <img
            src={loading}
            className={`w-[30px] ${
              isLoading2 ? "block" : "hidden"
            } cursor-default`}
          />
        </button> */}
      </div>
      <center className="m-4">{emails}</center>
      <center className="text-red text-5xl">{testedEmails}</center>
    </div>
  );
}

export default Login;
