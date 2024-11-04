import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.render(
  <React.StrictMode>
    <div
      style={{
        paddingTop: "30px",
        backgroundColor: "#30194d",
        height: "100%",
      }}
    >
      <App />
    </div>
  </React.StrictMode>,
  document.getElementById("root")
);
