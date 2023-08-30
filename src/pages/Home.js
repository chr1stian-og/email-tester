import axios from "axios";
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import validator from "validator";
import GaEventTracker from "../components/GaEventTracker";
import DOMPurify from "dompurify";

const currentYear = new Date().getFullYear();

//Global variables
const loading = require("../assets/loading.gif");
const api = axios.create({ baseURL: process.env.REACT_APP_LOCAL_API });
const gaEventTracker = GaEventTracker("Home Page");
let dialogTimeout;

//main function
function Home() {
  //States
  const [token, setToken] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [user, setUser] = useState({
    email: process.env.REACT_APP_EMAIL,
    password: process.env.REACT_APP_PASSWORD,
  });

  const [showDialog, setShowDialog] = useState({
    status: false,
    message: "",
    type: "",
  });

  const [abortController, setAbortController] = useState(null);
  const controller = new AbortController();
  const abortSignal = controller.signal;

  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  // const options = ["Email"];
  const options = ["Email", "Phone Number", "Domain", "MAC", "Blacklist"];

  const [contactToTest, setContactToTest] = useState({ contact: "" });
  const [contactType, setContactType] = useState("email");

  //Functions
  useEffect(() => {
    login();
    const controller = new AbortController();
    setAbortController(controller);
  }, []);

  useEffect(
    () => {
      changeContact();
    },
    [selectedOptionIndex],
    [contactType]
  );

  const login = () => {
    try {
      api
        .post("/login", user)
        .then((res) => {
          setToken(res.data.accessToken);
          callDialog("success", "");
        })
        .catch(() => {
          callDialog("error", "");
        });
    } catch (e) {
      console.log(e);
      callDialog("error", "Error while trying to login, try again");
    }
  };

  const stopTest = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

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

  function handleKeyDown(event) {
    if (event.keyCode === 13) {
      if (abortSignal && abortSignal.aborted) stopTest();
      else testContact(contactToTest);
    }
    if (event.keyCode === 38) {
      setSelectedOptionIndex(Math.max(selectedOptionIndex - 1, 0));
      event.preventDefault();
    } else if (event.keyCode === 40) {
      setSelectedOptionIndex(
        Math.min(selectedOptionIndex + 1, options.length - 1)
      );
      event.preventDefault();
    }
  }

  function changeContact() {
    document.getElementById("input-contact").value = "";
    var contactbox = document.getElementById("contact");
    const text = contactbox.options[contactbox.selectedIndex].text;
    document.getElementById("input-contact").type = text;

    if (text === "Email") {
      setSelectedOptionIndex(0);
      setContactType("email");
      document.getElementById("input-contact").focus();
      document.getElementById("input-contact").placeholder =
        "example@domain.com";
      document.getElementById("input-contact").type = "email";
      document.getElementById("contact").value = "Email";
      document.getElementById("test-result").innerHTML = "";
      setResult(null);
    }

    if (text === "Phone Number") {
      setSelectedOptionIndex(1);
      setContactType("phone");
      document.getElementById("input-contact").focus();
      document.getElementById("input-contact").placeholder = "XX-XXX-XXXX";
      document.getElementById("input-contact").type = "number";
      document.getElementById("contact").value = "Phone Number";
      document.getElementById("test-result").innerHTML = "";
      setResult(null);
    }
    if (text === "Domain") {
      setSelectedOptionIndex(2);
      setContactType("domain");
      document.getElementById("input-contact").focus();
      document.getElementById("input-contact").placeholder = "example.com";
      document.getElementById("input-contact").type = "text";
      document.getElementById("contact").value = "Domain";
      document.getElementById("test-result").innerHTML = "";
      setResult(null);
    }
    if (text === "MAC") {
      setSelectedOptionIndex(3);
      setContactType("mac");
      document.getElementById("input-contact").focus();
      document.getElementById("input-contact").placeholder =
        "00:00:00:00:00:00";
      document.getElementById("input-contact").type = "text";
      document.getElementById("contact").value = "MAC";
      document.getElementById("test-result").innerHTML = "";
      setResult(null);
    }
    if (text === "Blacklist") {
      setSelectedOptionIndex(4);
      setContactType("blacklist");
      document.getElementById("input-contact").focus();
      document.getElementById("input-contact").placeholder =
        "IP address or domain name";
      document.getElementById("input-contact").type = "text";
      document.getElementById("contact").value = "Blacklist";
      document.getElementById("test-result").innerHTML = "";
      setResult(null);
    }
  }

  function testContact(contactToTest) {
    if (
      DOMPurify.sanitize(contactToTest, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    ) {
      if (contactType === "email") {
        testEmail(contactToTest);
      } else if (contactType === "phone") {
        testPhone(contactToTest);
      } else if (contactType === "domain") {
        testDomain(contactToTest);
      } else if (contactType === "mac") {
        testMac(contactToTest);
      } else if (contactType === "blacklist") {
        testLists(contactToTest);
      } else {
        callDialog(
          "error",
          "We cannot test that yet. Try other options.",
          document.getElementById("input-contact").type
        );
      }
    } else {
      return callDialog("error", "The input data is not valid");
    }
  }

  async function testDomain() {
    setIsLoading(false);
    if (contactToTest) {
      try {
        if (result === null || !isLoading) {
          setIsLoading(true);
          const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error("Timeout occurred"));
            }, 5000);
          });
          Promise.race([
            await api.post("/getDomainInfo", contactToTest, {
              signal: abortSignal,
              headers: {
                authorization: token,
              },
            }),
            timeoutPromise,
          ])
            .then((resp) => {
              setResult(resp.data);
              console.log(resp.data);
              setIsLoading(false);
            })
            .catch((err) => {
              setIsLoading(false);
              if (err.message === "Timeout occurred")
                document.getElementById("test-result").innerText =
                  "Timeout occurred while waiting for a response";
              console.log(err.message);
            })
            .finally(() => {
              setAbortController(null);
            });
        }
      } catch (err) {
        setIsLoading(false);
        callDialog(
          "error",
          "Error occurred while testing this domain, please check your internet connection"
        );
        console.log(err.message);
      }
    } else {
      callDialog("error", "Type a domain on the input box");
    }
  }

  function testMac() {
    setIsLoading(false);
    try {
      if (contactToTest && (result === null || !isLoading)) {
        setIsLoading(true);
        const timeoutPromise = new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error("Timeout occurred"));
          }, 5000);
        });
        Promise.race([
          api.post("/getMacInfo", contactToTest, { signal: abortSignal }),
          timeoutPromise,
        ])
          .then((resp) => {
            setResult(resp.data);
            setIsLoading(false);
          })
          .catch((err) => {
            setIsLoading(false);
            if (err.message === "Timeout occurred") {
              document.getElementById("test-result").innerText =
                "Timeout occurred while waiting for a response";
            }
            console.log(err.message);
          })
          .finally(() => {
            return setAbortController(null);
          });
      }
    } catch (err) {
      setIsLoading(false);
      callDialog(
        "error",
        "Error getting this device infomation, please check your internet connection"
      );
      console.log(err.message);
    }
  }

  function testLists() {
    setIsLoading(false);
    if (contactToTest) {
      try {
        if (result === null || !isLoading) {
          setIsLoading(true);

          const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error("Timeout occurred"));
            }, 60000);
          });
          Promise.race([
            api.post("/getListings", contactToTest, { signal: abortSignal }),
            timeoutPromise,
          ])
            .then((resp) => {
              setResult(resp.data);
              setIsLoading(false);
            })
            .catch((err) => {
              setIsLoading(false);
              if (err.message === "Timeout occurred")
                document.getElementById("test-result").innerText =
                  "Timeout occurred while waiting for a response";
              console.log(err.message);
            })
            .finally(() => {
              return setAbortController(null);
            });
        }
      } catch (err) {
        setIsLoading(false);
        callDialog(
          "error",
          "Error ocurred while getting the listing, please check your internet connection"
        );
        console.log(err.message);
      }
    } else {
      callDialog("error", "type an domain or ip on the input box");
    }
  }

  function testPhone() {
    setIsLoading(false);
    if (contactToTest) {
      try {
        if (result === null || !isLoading) {
          setIsLoading(true);

          const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error("Timeout occurred"));
            }, 10000);
          });
          // Send the API request and handle the response or timeout
          Promise.race([
            api.post("/testNumber", contactToTest, { signal: abortSignal }),
            timeoutPromise,
          ])
            .then((resp) => {
              setResult(resp.data);
              setIsLoading(false);
            })
            .catch((err) => {
              setIsLoading(false);
              if (err.message === "Timeout occurred")
                document.getElementById("test-result").innerText =
                  "Timeout occurred while waiting for a response";
              console.log(err.message);
            })
            .finally(() => {
              return setAbortController(null);
            });
        }
      } catch (err) {
        setIsLoading(false);
        callDialog(
          "error",
          "Error while testing this phone number, please check your internet connection"
        );
        console.log(err.message);
      }
    } else {
      callDialog("error", "Type a phone number on the input box");
    }
  }

  function testEmail() {
    setIsLoading(false);
    if (!validator.isEmail(contactToTest.contact))
      return callDialog("error", "The email is invalid");
    try {
      if (result === null || !isLoading) {
        setIsLoading(true);
        const timeoutPromise = new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error("Timeout occurred"));
          }, 30000);
        });
        Promise.race([
          api.post("/testEmail", contactToTest, {
            signal: abortSignal,
          }),
          timeoutPromise,
        ])
          .then((resp) => {
            setResult(resp.data);
            setIsLoading(false);
          })
          .catch((err) => {
            setIsLoading(false);
            if (err.message === "Timeout occurred")
              document.getElementById("test-result").innerText =
                "Timeout occurred while waiting for a response";
          })
          .finally(() => {
            return setAbortController(null);
          });
      }
    } catch (err) {
      setIsLoading(false);
      callDialog(
        "error",
        "Error occurred while testing email, please check your internet connection"
      );
    }
  }

  return (
    <div className="h-screen">
      <Navbar />
      <div
        className={`${!showDialog.status ? "hidden" : "fixed"} alert ${
          showDialog.type === "success" ? "alert-success" : "alert-error"
        } shadow-lg z-50 w-fit bottom-4 right-4`}
      >
        <div>
          <span className="font-bold">{showDialog.message}</span>
        </div>
      </div>
      <center className="rounded-lg mx-10">
        <h1 className="mt-14 text-2xl sm:text-[35px] font-bold text-[#787878] transform-all duration-500 ">
          Single test
        </h1>
        <div className="flex flex-col gap-4 mt-20 items-center backgroundColor-[#b05b5b] p-20 rounded-sm">
          <select
            id="contact"
            type="text"
            className="rounded-lg hover:cursor-pointer bg-[#dadada] text-[#484848] text-md p-2 duration-150  hover:scale-105"
            onChange={changeContact}
            value={options[selectedOptionIndex]}
            onKeyDown={handleKeyDown}
          >
            {options.map((option, index) => (
              <option
                onChange={changeContact}
                id="contact-options"
                key={index}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>

          <div className="flex flex-col  sm:flex-row justify-center align-center items-center gap-4 ">
            <div className="flex flex-row gap-4 items-center">
              <h1 className="text-[#949494] text-2xl">
                {document.getElementById("input-contact")?.type === "number"
                  ? "+258"
                  : ""}
              </h1>
              <input
                id="input-contact"
                type="email"
                maxLength={50}
                onChange={(e) => {
                  setContactToTest({ contact: e.target.value });
                }}
                onKeyDown={handleKeyDown}
                min={5}
                placeholder="example@domain.com"
                className={` ${
                  result !== "The email is valid" || result === "No registry"
                    ? "input-warning"
                    : "input-success"
                } input ${
                  result ? "" : "input-bordered input-error"
                } sm:w-full min-w-[350px] hover:scale-105 sm:max-w-xs text-xl transition-all duration-500`}
              />
            </div>
            <button
              id="test-button"
              type="submit"
              onClick={() => testContact(contactToTest)}
              className={` ${
                !isLoading ? "btn btn-error w-fit" : "block"
              } duration-150  hover:scale-105  transition-all`}
            >
              <span className={`${!isLoading ? "block" : "hidden"}`}>
                Test {contactType}
              </span>
              <img
                onClick={stopTest}
                src={loading}
                className={`w-[30px] ${
                  isLoading ? "block" : "hidden"
                } hover:cursor-pointer`}
              />
            </button>
          </div>
        </div>
      </center>
      <div
        className={` ${
          result
            ? "mx-8 sm:mx-28 min-w-[200px] my-16 text-center flex flex-row items-center align-center justify-center px-10 py-20 bg-[#dadada] rounded-xl"
            : "hidden"
        }`}
      >
        <h1
          id="test-result"
          className={`
        ${
          result === "The email is valid"
            ? "text-green-400"
            : result !== "No registry"
            ? "text-green-400"
            : result !== "No data associated with this device"
            ? "text-[#ffa01a]"
            : "text-green-400"
        } text-xl font-bold
        `}
        >
          {result || "No Data"}
        </h1>
      </div>
      <>
        <div className="absolute bottom-4 left-4">
          <h1 className="mix-blend-overlay text-white">
            © Christian MacArthur, {currentYear}
          </h1>
        </div>
      </>
    </div>
  );
}

export default Home;
