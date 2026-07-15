import React from "react";
import ReactDOM from "react-dom/client";
import "./storage.js";       // IMPORTANTE: antes de App
import "./index.css";
import App, { PublicKycForm } from "./App.jsx";

// ?kyc=<token> serves the public KYC form instead of the CRM. Branching here
// rather than inside App keeps the auth/session machinery from ever running for
// a client who has a link but no account.
const kycToken = new URLSearchParams(window.location.search).get("kyc");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {kycToken ? <PublicKycForm token={kycToken} /> : <App />}
  </React.StrictMode>
);