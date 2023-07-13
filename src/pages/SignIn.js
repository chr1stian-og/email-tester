import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import validator from "validator";
import { auth } from "../components/firebase.js";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";

const logo = require("../assets/clubnet-black.png");

function SignIn() {
  let navigate = useNavigate();
  const [user, setUser] = useState({ email: "", password: "" });
  const [passwordToMatch, setPasswordToMatch] = useState("");

  const checkLogin = () => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate("/home", { replace: true });
      }
    });
    return unsubscribe;
  };

  const signup = async () => {
    if (!validator.isEmail(user.email))
      return alert("the email format is incorrect");

    if (user.password === passwordToMatch) {
      try {
        const signin = await createUserWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );
        checkLogin();
      } catch (err) {
        console.log(err.message);
        alert(err.message);
      }
    } else {
      alert("Passwords doesn't match");
    }
  };

  return (
    <div className="h-screen mt-36 overflow-y-hidden">
      <span className="flex my-10 text-[#ec1554] min-w-max font-bold text-3xl justify-center items-center align-center">
        <img src={logo} width="200px" />
      </span>
      <div className="flex flex-col gap-2 items-center">
        <input
          onChange={(e) => {
            setUser({ ...user, email: e.target.value });
          }}
          max={30}
          placeholder="Email account"
          className="rounded-lg border-[#ec1554] px-2 py-2 w-[200px] sm:w-[350px] text-lg"
          min={5}
        />
        <input
          onChange={(e) => {
            setUser({ ...user, password: e.target.value });
          }}
          min={6}
          max={30}
          type="password"
          placeholder="Password"
          className="rounded-lg  border-[#ec1554] px-2 py-2 w-[200px] sm:w-[350px] text-lg"
        />
        <input
          onChange={(e) => {
            setPasswordToMatch(e.target.value);
          }}
          min={6}
          max={30}
          type="password"
          placeholder="Confirm Password"
          className="rounded-lg border-[#ec1554] px-2 py-2 w-[200px] sm:w-[350px] text-lg"
        />
        <button
          onClick={signup}
          className="bg-[#ec1554] mt-4 px-4 py-3 w-[200px] sm:w-[350px] text-white rounded-xl"
        >
          SIGNUP
        </button>
        <Link to="/login">
          <button
            type="submit"
            className="border-2 border-[#ec1554] text-[#ec1554] text-md mt-[5px] px-4 py-2 w-[200px] sm:w-[350px] rounded-xl"
          >
            LOGIN{" "}
          </button>
        </Link>
      </div>
    </div>
  );
}

export default SignIn;
