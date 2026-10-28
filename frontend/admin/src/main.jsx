import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./routers/router.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import './index.css';
import MobileBlocker from "./components/MobileBlocker";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <MobileBlocker>
        <RouterProvider router={router} />
      </MobileBlocker>
    </AuthProvider>
  </React.StrictMode>
);