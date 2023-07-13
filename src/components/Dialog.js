import React, { Component } from "react";

class Dialog extends Component {
  render() {
    let dialog = (
      <div style={dialogStyles} className="gap-2">
        <div>{this.props.children}</div>
        <div className="flex flex-row gap-2 justify-end">
          <button
            className="bg-red-500 px-6 py-1 rounded-lg"
            onClick={this.props.onClose}
          >
            NO
          </button>
          <button
            className="bg-red-500 px-6 py-1 rounded-lg"
            onClick={() => alert("accepted")}
          >
            YES
          </button>
        </div>
      </div>
    );

    if (!this.props.isOpen) {
      dialog = null;
    }
    return <div>{dialog}</div>;
  }
}
let dialogStyles = {
  width: "auto",
  maxWidth: "100%",
  margin: "0 auto",
  position: "fixed",
  left: "50%",
  top: "50%",
  transform: "translate(-50%,-50%)",
  zIndex: "999",
  backgroundColor: "#b8b8b8",
  padding: "10px 20px 20px",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
};

let dialogCloseButtonStyles = {
  marginBottom: "15px",
  padding: "3px 8px",
  cursor: "pointer",
  borderRadius: "50%",
  border: "none",
  width: "30px",
  height: "30px",
  fontWeight: "bold",
  alignSelf: "flex-end",
};

export default Dialog;
