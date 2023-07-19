import React, { Component, useEffect } from "react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <div className="absolute bottom-4 left-4">
        <h1 className="mix-blend-overlay text-white min-w-fit">
          © Christian MacArthur, {currentYear}
        </h1> 
      </div>
    </>
  );
}

export default Footer;
