import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CondoProvider } from "./context/CondoContext";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./components/ui/ToastContainer";
import { AppRouter } from "./AppRouter";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CondoProvider>
            <AppRouter />
            <ToastContainer />
          </CondoProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
