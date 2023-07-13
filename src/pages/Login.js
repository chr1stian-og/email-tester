import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import validator from "validator";
import { auth } from "../components/firebase.js";

const logo = require("../assets/clubnet-black.png");

function Login() {
  let navigate = useNavigate();
  const [user, setUser] = useState({ email: "", password: "" });

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = () => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          navigate("/home", { replace: true });
        }
      });
      return unsubscribe;
  };

  const login = async () => {
    if (!validator.isEmail(user.email))
      return alert("the email format is incorrect");

    try {
      const login = await signInWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      checkLogin();
    } catch (error) {
      console.log(error.message);
      alert(error.message);
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
          placeholder="Email"
          className="rounded-lg border-[#ec1554] px-2 py-2 w-[200px] sm:w-[350px] text-lg"
          min={5}
        />
        <input
          onChange={(e) => {
            setUser({ ...user, password: e.target.value });
          }}
          min={5}
          max={30}
          type="password"
          placeholder="Password"
          className="rounded-lg border-[#ec1554] px-2 py-2 w-[200px] sm:w-[350px] text-lg"
        />
        <div className="flex flex-col gap-2 m-2">
          <button
            onClick={login}
            className="bg-[#ec1554]  px-4 py-2 w-[200px] sm:w-[350px] text-white rounded-xl"
          >
            LOGIN
          </button>

          <Link to="/signin">
            <button
              type="submit"
              className="border-[#ec1554] text-[#ec1554] border-2  px-4 py-2 w-[200px] sm:w-[350px] rounded-xl"
            >
              SIGNUP{" "}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
