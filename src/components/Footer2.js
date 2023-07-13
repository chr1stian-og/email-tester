import React, { Component } from "react";

const logo = require("../assets/Logo-Branco.png");
function Footer() {
  return (
    <>
      <footer className="bg-[#cbcbcb] p-2 flex flex-col gap-2 absolute bottom-0">
        <div className="flex flex-col sm:flex-row gap-2 justify-between align-center items-center">
          <img
            src={logo}
            width="150px"
            onClick={() => {
              window.open("https://clubnet.mz/");
            }}
          />
          <h1 className="font-thin text-sm max-w-[190px] sm:max-w-[250px]">
            Moztel, Lda R. Dr Egas Moniz 47 - {"\n"} Bairro da Sommerschield 1,
            Maputo - Moçambique
          </h1>
          <div>
            <h1 className="font-thin text-sm">1747 - Helpdesk</h1>
            <h1 className="font-thin text-sm">
              84 563 5 563 - Assistência Técnica
            </h1>
            <h1 className="font-thin text-sm">helpdesk@clubnet.mz</h1>
          </div>
        </div>
        <center>
          <hr className="text-slate-300"></hr>
          <h1>Clubnet @ 2022</h1>
        </center>
      </footer>
    </>
  );
}

export default Footer;
