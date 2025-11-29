// file: src/App.tsx

import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import TherapyReflectionApp from "./components/TherapyReflectionApp";
import { useOmegaPro } from "./hooks/useOmegaPro";
import SuccessPage from "./SuccessPage";
import CancelledPage from "./CancelledPage";

function MainLayout() {
  const isPro = useOmegaPro();

  return (
    <div className="tra-shell">
      <header className="tra-header">
        <h1 className="tra-title">THERAPY REFLECTION SPACE</h1>
        <p className="tra-subtitle">
          A gentle, therapist-designed reflection tool for support workers, carers, and overwhelmed adults.
        </p>
      </header>

      <main className="tra-main">
        <TherapyReflectionApp />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/reflect" element={<MainLayout />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancelled" element={<CancelledPage />} />
      </Routes>
    </HashRouter>
  );
}
