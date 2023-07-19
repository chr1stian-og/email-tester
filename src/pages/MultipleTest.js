import React, { useEffect, useRef } from "react";
import axios from "axios";
import { useState } from "react";
import Navbar from "../components/Navbar";
import GaEventTracker from "../components/GaEventTracker";

//Global variables
const loading = require("../assets/loading.gif");
const api = axios.create({ baseURL: process.env.REACT_APP_REMOTE_API });
const gaEventTracker = GaEventTracker("Multiple Page");

//main function
function MultipleTest() {

  //States
  const [token, setToken] = useState("");

  const hiddenFileInput = useRef(null);

  const [emailList, setEmailList] = useState({ contact: [] });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [showDialog, setShowDialog] = useState({
    status: false,
    message: "",
    type: "",
  });
  const [user, setUser] = useState({
    email: process.env.REACT_APP_EMAIL,
    password: process.env.REACT_APP_PASSWORD,
  });
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  const [result, setResult] = useState([]);

  const [abortController, setAbortController] = useState(null);
  const controller = new AbortController();
  const abortSignal = controller.signal;

  const login = () => {
    try {
      api
        .post("/login", user)
        .then((res) => {
          setToken(res.data.accessToken);
          //Logged in successfully!
          callDialog("success", "");
        })
        .catch((err) => {
          //wrong username or password
          callDialog("error", "");
        });
    } catch (e) {
      console.log(e);
      callDialog("error", "Error while trying to login, try again");
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

  useEffect(() => {
    login();
    const controller = new AbortController();
    setAbortController(controller);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function handleClick() {
    hiddenFileInput.current.click();
  }

  const handleChange = (e) => {
    let file = e.target.files[0];
    if (file?.type === "text/plain") {
      let reader = new FileReader();
      let fileText = "";
      try {
        reader.onload = (event) => {
          fileText = event.target.result;
          const emailArray = fileText
            .split(/\r?\n/)
            .filter((line) => line.trim() !== "");
          setEmailList((prevEmailList) => ({
            ...prevEmailList,
            contact: emailArray,
          }));
        };
        reader.readAsText(file);
      } catch (error) {
        console.error("Error reading the file: ", error);
      }
    } else {
      return callDialog("error", "Please choose a .txt file");
    }
  };

  async function testList() {
    setIsLoading(false);
    setIsLoading2(false);
    try {
      if (emailList.contact.length && (!isLoading || !result.length)) {
        setResult([]);
        setIsLoading(true);
        for (let email in emailList.contact) {
          setIsLoading2(true);
          try {
            const timeoutPromise = new Promise((resolve, reject) => {
              setTimeout(() => {
                reject(new Error("Timeout occurred"));
              }, 5000);
            });
            const response = await Promise.race([
              api.post("/testEmailList", emailList.contact[email], {
                signal: abortSignal,
                headers: {
                  authorization: token,
                },
              }),
              timeoutPromise,
            ]);
            setResult((result) => [...result, response.data]);
          } catch (err) {
            if (err.message === "Timeout occurred") {
              setResult((result) => [...result, err.message]);
            }
          } finally {
            setIsLoading2(false);
          }
        }
        setIsLoading(false);
        setIsLoading2(false);
      }
    } catch (err) {
      setIsLoading(false);
      callDialog(
        "error",
        "Error occurred while testing email, please check your internet connection"
      );
    }
  }

  // useEffect(() => {}, [nrNotChangedPass]);

  // async function testPass() {
  //   var error = 0;
  //   if (emailList) {
  //     setResult([]);
  //     for (var i in emailList) {
  //       setIsLoading(true);
  //       await api
  //         .post("/testPass", emailList[i], password, { signal: abortSignal })
  //         .then((resp) => {
  //           setResult(
  //             (result) => [...result, resp.data],
  //             () => {
  //               if (resp.data === "Change your password!") {
  //                 setNrNotChangedPass(nrNotChangedPass + 1);
  //               }
  //             }
  //           );
  //           setIsLoading(false);
  //           setIsLoading2(false);
  //         })
  //         .catch((err) => {
  //           error = 1;
  //           setIsLoading(false);
  //           setIsLoading2(false);
  //           console.log("Error while testing email" + err);
  //         })
  //         .finally(() => {
  //           setAbortController(null);
  //         });
  //     }
  //   } else {
  //     alert("Import a text file with emails to test");
  //   }
  //   if (error === 1) alert("Some error ocurred while testing emails");
  // }

  // function testSingle(email) {
  //   var error = 0;
  //   if (email) {
  //     setIsLoading2(true);
  //     api
  //       .post("/testEmail", email.trim(), { signal: abortSignal })
  //       .then((resp) => {
  //         alert(resp.data);
  //         setIsLoading(false);
  //         setIsLoading2(false);
  //       })
  //       .catch((err) => {
  //         setIsLoading(false);
  //         setIsLoading2(false);
  //         error = 1;
  //         console.log("Error while testing email" + err);
  //       })
  //       .finally(() => {
  //         setAbortController(null);
  //       });
  //     console.log(result);
  //   } else {
  //     alert("Erro. Try Again");
  //   }
  //   if (error === 1) alert("Some error ocurred while testing emails");
  // }

  const stopTest = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  const gaEventTracker = GaEventTracker("Multiple Page");

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
      <center className="mt-8 items-center"></center>
      <h1 className="mt-14 flex justify-center text-2xl sm:text-[35px] font-bold text-[#787878] transform-all duration-500 ">
        Multiple test
      </h1>
      <div className="flex flex-col rounded-lg mx-10 items-center justify-center align-center gap-4 backgroundColor-[#b05b5b] mt-24 mb-10 sm:mx-20">
        {!emailList.contact.length && (
          <>
            <button
              onClick={handleClick}
              className=" text-xl rounded-md py-2 px-4 hover:border-[#ffffff] hover:border-2 transition-all duration-100"
            >
              Choose email list
            </button>
            <input
              ref={hiddenFileInput}
              type="file"
              onChange={handleChange}
              style={{ display: "none" }}
              min={5}
            />
          </>
        )}
        <div className="flex flex-col gap-4 mt-[-50px] items-center">
          <h1
            className={`text-[#ec1554] ${
              emailList.contact.length > 0 ? "block" : "hidden"
            } min-w-max mb-4 font-bold text-3xl justify-center items-center align-center`}
          >
            {`${emailList.contact.length}  ${
              emailList.contact.length !== 1 ? "emails" : "email"
            }`}
          </h1>
          {/* <div className="sm:flex absolute sm:static bottom-4 z-50 sm:bottom-auto"> */}
          <div className="align-center flex flex-row">
            <button
              onClick={() => {
                setEmailList({ contact: [] });
                setResult([]);
                abortController && abortController.abort();
                return window.location.reload();
              }}
              // onClick={() => window.open("/multiple", "_self")}
              className={`btn btn-error ${
                emailList.contact.length ? "" : "hidden"
              } mr-2  duration-100 hover:scale-105`}
            >
              <span className="text-xs  ">remove file</span>
            </button>
            {/* <button
            id="test-button"
            onClick={testPass}
            className={` ${!isLoading2 ? "btn btn-error w-fit" : ""} ${
              emailList.length ? "" : "hidden"
            } mr-2 items-center duration-150 transition-all`}
          >
            <span className={`${!isLoading2 ? "" : "hidden"}`}>
              {emailList.length > 1 ? "Test Passwords" : "Test Password"}
            </span>
            <img
              onClick={stopTest}
              src={loading}
              className={`w-[30px] ${
                isLoading2 ? "block" : "hidden"
              }  hover:cursor-pointer`}
            />
          </button> */}
            <button
              onClick={testList}
              type="submit"
              id="test-button2"
              className={` ${!isLoading ? "btn btn-error w-fit" : ""} ${
                emailList.contact.length ? "" : "hidden"
              } mr-2 items-center duration-100 hover:scale-105`}
            >
              <span className={`${!isLoading ? "block" : "hidden"} text-xs`}>
                {emailList.contact.length > 1 ? "Test Emails" : "Test Email"}
              </span>
              <img
                onClick={() => {
                  alert("Stopping the test");
                  gaEventTracker("Test Emails");
                  console.log("Test stopped.");
                  window.location.reload();
                  // stopTest();
                }}
                src={loading}
                className={`w-[30px] ${
                  isLoading ? "block" : "hidden"
                } hover:cursor-pointer`}
              />
            </button>
          </div>
        </div>
        {/* <label
          className={`${
            emailList.length != 0 ? "" : "hidden"
          } mt-6 text-[#a2a2a2] `}
        >
          Type password to test
        </label>
        <input
          id="password"
          maxLength={50}
          onChange={(e) => setPassword(e.target.value)}
          className={` ${
            emailList.length != 0 ? "" : "hidden"
          } w-[375px] rounded-lg px-4 py-1`}
          placeholder="111abcABC#"
        /> */}
      </div>
      <center className="flex flex-col justify-center">
        {/* <h1 className={`${nrNotChangedPass === 0 ? "hidden" : ""}`}>
          {nrNotChangedPass}
        </h1>
        */}
        <div
          className={`${
            emailList.contact.length !== 0 ? "" : "hidden"
          } items-center min-w-fit align-center mx-2 sm:mx-10 rounded-lg mb-10 p-4`}
        >
          {emailList.contact.map((email, id) => (
            <div
              className={`${
                email.length === 0 ? "hidden" : "flex"
              } justify-between gap-4 ${
                screenSize.width < 640 && result[id]
                  ? result[id] === "The email is valid"
                    ? "bg-green-400"
                    : "bg-[#ffa01a]"
                  : "bg-[#e6e6e6]"
              } p-4 sm:p-2 mb-1 rounded-xl min-w-fit items-center transition-all duration-1000`}
            >
              <h1 className="text-sm sm:text-lg transition-all duration-500">
                {email.trim()}
              </h1>
              <button
                className={`${!isLoading2 ? "" : ""} ${
                  result[id] === "The email is valid"
                    ? "text-green-500"
                    : "text-[#ffa01a]"
                } ${
                  screenSize.width > 640 ? "block" : "hidden"
                } cursor-pointer min-w-fit hover:opacity-70 transition-all duration-250`}
              >
                <span className={`${result[id] ? "" : "hidden"}`}>
                  {result[id]}
                </span>
                {!result[id] && isLoading && (
                  <img src={loading} className={`max-w-[15px]`} />
                )}
              </button>
            </div>
          ))}
        </div>
      </center>
    </div>
  );
}

export default MultipleTest;
