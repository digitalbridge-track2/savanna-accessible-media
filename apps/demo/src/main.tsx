import React from "react";
import ReactDOM from "react-dom/client";
import "@abugida/media-kit";
import "./styles/tokens.css";
import { RouterProvider } from "./router";
import { App } from "./App";

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider>
        <App />
      </RouterProvider>
    </React.StrictMode>
  );
}
