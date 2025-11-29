import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { TherapyReflectionApp } from "./components/TherapyReflectionApp";
import { ProSuccessPage } from "./pages/ProSuccessPage";

export const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/pro-success"
          element={<ProSuccessPage />}
        />
        <Route
          path="/"
          element={
            <div className="tra-shell">
              <header className="tra-header">
                <h1 className="tra-title">Therapy Reflection Space</h1>
                <p className="tra-subtitle">
                  A gentle, therapist-designed reflection tool for support workers, carers, and overwhelmed adults.
                </p>
              </header>
              <main className="tra-main">
                <TherapyReflectionApp />
              </main>
              <footer className="tra-footer">
                <p>
                  Privacy: Nothing you write here is stored or saved by this app. Your text only lives in this browser window.
                  If you choose to use the AI helper, your reflection is sent securely to the AI provider just to generate the
                  summary you see.
                </p>
              </footer>
            </div>
          }
        />
      </Routes>
    </HashRouter>
  );
};
