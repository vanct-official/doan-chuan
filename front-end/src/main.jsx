import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./i18n/index.js";
import { AppThemeProvider } from "./theme/ThemeContext.jsx";
import "./index.css";
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'whatwg-fetch'

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </React.StrictMode>,
);
