import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import { aplicarTema, lerTema } from "./services/tema";
import "./styles/globals.css";

aplicarTema(lerTema());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
