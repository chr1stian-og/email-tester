import React, { Component } from "react";

const Alert = ({ message }) => {
  const result = message;

  return (
    <div
      className={`fixed alert ${
        result === "A sua refeição está sendo preparada"
          ? "alert-success"
          : result === "Pedido cancelado com sucesso"
          ? "alert-success"
          : "alert-error"
      } shadow-lg z-50 w-[300px] bottom-4 right-4`}
    >
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current flex-shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{result}</span>
      </div>
    </div>
  );
};

export default Alert;
