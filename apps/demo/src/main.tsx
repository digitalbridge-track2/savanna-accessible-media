import React from "react";
import ReactDOM from "react-dom/client";
import "@abugida/media-kit";
import "./read-aloud/read-aloud.css";
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
