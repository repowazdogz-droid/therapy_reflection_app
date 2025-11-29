import { HashRouter, Routes, Route } from "react-router-dom"
import TherapyReflectionApp from "./components/TherapyReflectionApp"
import SuccessPage from "./SuccessPage"
import CancelledPage from "./CancelledPage"

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TherapyReflectionApp />} />
        <Route path="/reflect" element={<TherapyReflectionApp />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancelled" element={<CancelledPage />} />
      </Routes>
    </HashRouter>
  )
}
