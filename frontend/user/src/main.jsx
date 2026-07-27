import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./index.css";

import { RegistrationProvider } from "./context/RegistrationContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <RegistrationProvider>
        <Toaster position="top-right" />
        <App />
      </RegistrationProvider>
    </BrowserRouter>
  </React.StrictMode>
);