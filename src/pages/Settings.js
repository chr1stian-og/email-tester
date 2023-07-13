import React from "react";
import Navbar from "../components/Navbar";

function Settings() {
  return (
    <div className="h-screen">
      <Navbar />
      <center className="mt-10">
        <h1 className="text-[#ec1554] font-bold text-3xl justify-center items-center align-center">
          Settings
        </h1>
      </center>
      <form className="flex flex-col sm:flex-row items-center justify-center align-center gap-4 mt-20 backgroundColor-[#b05b5b] p-20 rounded-sm">
        <h1 className="font-bold text-3xl justify-center items-center align-center">
          Coming soon
        </h1>
      </form>
    </div>
  );
}

export default Settings;
