import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { auth } from "./firebase.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const clubnetlogo = require("../assets/clubnet-black.png");
const loading = require("../assets/loading.gif");

const api = axios.create({
  baseURL: process.env.REACT_APP_REMOTE_API,
});

function Navbar() {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({
    email: process.env.REACT_APP_EMAIL,
    password: process.env.REACT_APP_PASSWORD,
  });
  const [showDialog, setShowDialog] = useState({
    status: false,
    message: "",
    type: "",
  });
  const navigate = useNavigate();

  const logout = () => {
    auth
      .signOut()
      .then(() => {
        navigate("/login", { replace: true });
      })
      .catch((error) => alert(error.message));
  };

  const login = () => {
    setIsLoading(false);

    try {
      setIsLoading(true);
      api
        .post("/login", user)
        .then((res) => {
          setToken(res.data.accessToken);
          setIsLoading(false);
          console.log(res.data.accessToken);
          callDialog("success", "Logged in successfully!");
        })
        .catch((err) => {
          setIsLoading(false);
          callDialog("error", err.response.data.error);
        });
    } catch (err) {
      setIsLoading(false);
      callDialog("error", "Error while trying to login, try again");
      console.log(err.message);
    }
  };

  let dialogTimeout;

  const callDialog = (type, message) => {
    if (dialogTimeout) {
      clearTimeout(dialogTimeout);
    }
    setShowDialog({
      status: true,
      message: message,
      type: type ? type : "success",
    });
    dialogTimeout = setTimeout(() => {
      setShowDialog({ status: false, message: "", type: "" });
    }, 3000);
  };

  function showMenu() {
    var list = document.querySelector("ul");
    var e = document.querySelector("#menu");

    if (e.name == null) {
      e.name = "menu";
    }

    if (e.name === "menu") {
      e.name = "close";
      list.classList.remove("top-[-400px]");
      list.classList.remove("opacity-0");
    } else {
      e.name = "menu";
      list.classList.add("top-[-400px]");
      list.classList.add("opacity-0");
    }
  }

  function closeNavbar() {
    var e = document.querySelector("#menu");
    var list = document.querySelector("ul");
    e.name = "close";
    list.classList.add("top-[-400px]");
    list.classList.add("opacity-0");
  }

  return (
    <>
      <div
        className={`${!showDialog.status ? "hidden" : "fixed"} alert ${
          showDialog.type === "success" ? "alert-success" : "alert-error"
        } shadow-lg z-50 w-fit bottom-4 right-4`}
      >
        <div>
          <span className="font-bold">{showDialog.message}</span>
        </div>
      </div>
      {/* <nav className="bg-white shadow sm:flex sm:items-center sm:justify-between py-2 px-4 z-10"> */}
      <nav className="bg-white shadow flex items-center justify-between py-2 px-4 z-10">
        <div className="flex justify-between items-center">
          <span className="text-lg cursor-pointer">
            <img
              onClick={() =>
                window.open("https://email.christianmacarthur.com/", "_self")
              }
              className="max-w-[100px] font-semibold  duration-150"
              src={clubnetlogo}
            />
          </span>
          <h1 className="text-lg cursor-pointer hidden  ">
            <p name="menu" id="menu" onClick={showMenu}>
              <GiHamburgerMenu />{" "}
            </p>
          </h1>
        </div>
        {/* <ul className="md:flex md:items-center p-4 sm:p-4 gap-4 sm:px-4 sm:gap-10 md:gap-4 md:z-auto md:static absolute bg-white border-2 rounded-md border-[#b05b5b] sm:border-[#f04088] md:border-transparent w-[250px] sm:inset-x-2/4 inset-x-2/4 md:w-auto md:py-0 md:pl-0 md:opacity-100 opacity-100 top-[-400px] transition-all duration-150"> */}
        <ul className="flex items-center p-4 gap-4 x-4 z-auto static  bg-white border-2 rounded-md border-[#b05b5b] border-transparent inset-x-2/4 w-auto py-0 pl-4 opacity-100 transition-all duration-150">
          <li className="bg-[#ebebeb] duration-300 sm:px-4 rounded-lg w-fit px-2 cursor-pointer hover:bg-[#b7b7b7]">
            <Link to="/home">
              <h1
                onClick={closeNavbar}
                // className="my-4 md:my-0 font-semibold duration-150 text-lg"
                className="my-0 font-semibold duration-150 text-lg"
              >
                Single
              </h1>
            </Link>
          </li>
          <li className="bg-[#ebebeb] duration-300 sm:px-4 rounded-lg w-fit px-2 cursor-pointer hover:bg-[#b7b7b7]">
            <Link to="/multiple">
              <h1
                onClick={closeNavbar}
                // className="my-4 md:my-0  font-semibold duration-150 text-lg"
                className="my-0  font-semibold duration-150 text-lg"
              >
                Multiple
              </h1>
            </Link>
          </li>
          <li
            onClick={login}
            className={` ${
              !isLoading ? "bg-[#ebebeb] hover:bg-[#b7b7b7]" : "block"
            } duration-300 sm:px-4 rounded-lg w-fit px-2 cursor-pointer `}
          >
            <h1
              id="test-button"
              type="submit"
              // className={`  my-4 md:my-0 font-semibold duration-150 text-lg  transition-all`}
              className={`my-0 font-semibold duration-150 text-lg  transition-all`}
            >
              <span className={`${!isLoading ? "block" : "hidden"}`}>
                Login
              </span>
              <img
                src={loading}
                className={`w-[30px] ${
                  isLoading ? "block" : "hidden"
                } hover:cursor-pointer`}
              />
            </h1>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Navbar;
