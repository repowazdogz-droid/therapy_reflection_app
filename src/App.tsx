import React from "react";
import { TherapyReflectionApp } from "./components/TherapyReflectionApp";

export const App: React.FC = () => {
  return (
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
  );
};
