// file: src/App.tsx

import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import TherapyReflectionApp from "./components/TherapyReflectionApp";
import BuyAccessButton from "./components/BuyAccessButton";
import { useOmegaPro } from "./hooks/useOmegaPro";
import SuccessPage from "./SuccessPage";
import CancelledPage from "./CancelledPage";

function MainLayout() {
  const isPro = useOmegaPro();

  return (
    <div className="tra-shell">
      <div className="tra-container">
        {/* Top bar / upsell */}
        <header className="tra-header">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="tra-title">
                THERAPY REFLECTION SPACE
              </h1>
              <p className="tra-section-body text-sm">
                A gentle, therapist-designed reflection tool for support workers, carers, and overwhelmed adults.
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <BuyAccessButton />
              {!isPro && (
                <p className="text-xs text-gray-600">
                  3 free summaries remaining. Unlock unlimited + The Advanced
                  Reflective Workbook PDF.
                </p>
              )}
              {isPro && (
                <p className="text-xs text-emerald-600 font-medium">
                  ✓ Unlimited summaries unlocked on this device.
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Main app body */}
        <main>
          <TherapyReflectionApp />
        </main>
      </div>
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
