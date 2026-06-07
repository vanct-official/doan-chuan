import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./i18n/index.js";
import { AppThemeProvider } from "./theme/ThemeContext.jsx";
import { AppLocalizationProvider } from "./components/i18n/AppLocalizationProvider.jsx";
import "./index.css";
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'whatwg-fetch';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppThemeProvider>
      <AppLocalizationProvider>
        <App />
      </AppLocalizationProvider>
    </AppThemeProvider>
  </React.StrictMode>,
);
