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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top bar / upsell */}
      <header className="w-full border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Therapy Reflection
            </h1>
            <p className="text-xs text-slate-500">
              Guided reflection + gentle AI summaries.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1">
            <BuyAccessButton />
            {!isPro && (
              <p className="text-[11px] text-slate-500">
                3 free summaries remaining. Unlock unlimited + The Advanced
                Reflective Workbook PDF.
              </p>
            )}
            {isPro && (
              <p className="text-[11px] text-emerald-600 font-medium">
                Unlimited summaries unlocked on this device.
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Main app body */}
      <main className="mx-auto max-w-3xl px-4 py-6">
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
