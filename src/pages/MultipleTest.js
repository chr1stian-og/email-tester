import React, { useEffect, useRef } from "react";
import axios from "axios";
import { useState } from "react";
import Navbar from "../components/Navbar";

const loading = require("../assets/loading.gif");
const api = axios.create({ baseURL: process.env.REACT_APP_REMOTE_API });

function MultipleTest() {
  const hiddenFileInput = useRef(null);
  const [emailList, setEmailList] = useState({ contact: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [result, setResult] = useState([]);
  const [nrNotChangedPass, setNrNotChangedPass] = useState(0);
  const [password, setPassword] = useState("");

  const [abortController, setAbortController] = useState(null);
  const controller = new AbortController();
  const abortSignal = controller.signal;

  const handleChange = (e) => {
    var file = e.target.files[0];
    console.log(emailList.contact);
    console.log(emailList.contact.length);
    if (file) {
      var reader = new FileReader();
      var textFile = /text.*/;
      var fileText = "";
      if (file.type.match(textFile)) {
        reader.onload = (event) => {
          fileText = event.target.result;
          const emailArray = Array.from(fileText.split(/\r?\n/));
          setEmailList((prevEmailList) => ({
            ...prevEmailList,
            contact: emailArray,
          }));
        };
      } else {
        alert("Please choose a text file");
        return;
      }
      reader.readAsText(file);
    }
  };

  async function testList() {
    try {
      if (emailList.contact.length) {
        setResult([]);
        for (var i in emailList.contact) {
          setIsLoading(true);
          setIsLoading2(true);
          await api
            .post("/testEmail", emailList.contact[i], { signal: abortSignal })
            .then((resp) => {
              setResult((result) => [...result, resp.data]);
              setIsLoading(false);
              setIsLoading2(false);
            })
            .catch((err) => {
              setIsLoading(false);
              setIsLoading2(false);
              console.log("Error while testing email" + err);
            })
            .finally(() => {
              setAbortController(null);
              setIsLoading(false);
              setIsLoading2(false);
            });
        }
      } else {
        alert("Import a text file with emails to test");
      }
    } catch (err) {
      console.err(err);
      alert("Some error ocurred while testing emails");
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    setAbortController(controller);
  }, []);

  useEffect(() => {}, [nrNotChangedPass]);

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

  function handleClick() {
    hiddenFileInput.current.click();
  }

  const stopTest = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  };

  return (
    <div className="">
      <Navbar />
      <center className="mt-8 items-center">
        {/* <h1 className="text-[#ec1554] min-w-max font-bold text-3xl justify-center items-center align-center">
          Multiple Test
        </h1> */}
      </center>
      <div className="flex flex-col rounded-lg mx-10 items-center justify-center align-center gap-4 mt-10 backgroundColor-[#b05b5b] p-20">
        {!emailList.contact.length && (
          <>
            <h2 className="flex justify-center font-bold text-sm sm:text-xl align-center items-center min-w-max">
              Insira a lista de emails no formato *.txt
            </h2>
            <button
              onClick={handleClick}
              className="bg-[#c9c9c9] rounded-md py-2 px-4 hover:bg-[#ffffff] transition-all duration-100 hover:text-lg "
            >
              Add a file
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
        <div className="flex flex-row gap-4 mt-[-50px] items-center">
          <button
            // onClick={() => setEmailList([])}
            onClick={() => window.open("/multiple", "_self")}
            className={`btn btn-error ${
              emailList.contact.length ? "" : "hidden"
            } mr-2`}
          >
            <span className="text-xs ">remove file</span>
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
            } mr-2 items-center duration-150 transition-all`}
          >
            <span className={`${!isLoading ? "block" : "hidden"} text-xs`}>
              {emailList.contact.length > 1 ? "Test Emails" : "Test Email"}
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
      <center className="flex flex-col ">
        {/* <h1 className={`${nrNotChangedPass === 0 ? "hidden" : ""}`}>
          {nrNotChangedPass}
        </h1>
        */}
        <div
          className={`${
            emailList.contact.length !== 0 ? "" : "hidden"
          } items-center justify-center align-center mx-8 sm:mx-40 rounded-lg mb-10 bg-[#e6e6e6] p-4 min-w-fit`}
        >
          {emailList.contact.map((email, id) => (
            <>
              <div
                className={` ${
                  email.length === 0 ? "hidden" : "flex"
                }  justify-between gap-4 items-center`}
              >
                <h1 className="text-sm sm:text-lg transition-all duration-500">
                  {email.trim()}
                </h1>
                <button
                  key={id}
                  // onClick={() => testSingle(email)}
                  className={`${!isLoading2 ? "" : ""} ${
                    result[id] === "The email is valid"
                      ? "text-green-500"
                      : "text-[#636363]"
                    // : result[id] === "Password was changed"
                    // ? "text-green-500"
                    // : "text-red-500"
                  } cursor-pointer hover:opacity-70 transition-all duration-250`}
                >
                  <span className={`${result[id] ? "" : "hidden"}`} key={id}>
                    {result[id]}
                  </span>
                  {!result[id] && isLoading && (
                    <img src={loading} className={`max-w-[15px]`} />
                  )}
                </button>
              </div>
              <hr className="h-px bg-gray-400 border-0 dark:bg-gray-700 opacity-50"></hr>
            </>
          ))}
        </div>
      </center>
    </div>
  );
}

export default MultipleTest;
