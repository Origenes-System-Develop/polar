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

// Só em produção: no dev o cache do SW atrapalharia o hot reload.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}
