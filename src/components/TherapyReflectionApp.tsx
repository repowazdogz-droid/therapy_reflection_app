import { useState } from "react"
import { useOmegaPro } from "../hooks/useOmegaPro"
import BuyAccessButton from "./BuyAccessButton"

// Free tier summary limit
const FREE_LIMIT = 3

function TherapyReflectionApp() {
  const [reflectionText, setReflectionText] = useState("")
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryCount, setSummaryCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isPro = useOmegaPro()

  async function handleGenerateReflection() {
    // TODO: Implement 9-step reflection generation
    console.log("Generate 9-step reflection for:", reflectionText)
  }

  async function handleGenerateSummary() {
    // FREE USER BLOCKING
    if (!isPro && summaryCount >= FREE_LIMIT) {
      setSummary(null)
      alert(
        "You've reached your free summaries.\n\nUnlock unlimited summaries + your PDF for £14.99."
      )
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // TODO: Implement AI summary generation
      // const res = await fetch("/api/therapy-ai", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ text: reflectionText }),
      // })
      // 
      // if (!res.ok) throw new Error("API error")
      // 
      // const result = await res.json()
      // setSummary(result.summary ?? "No summary generated.")

      // increment count
      if (!isPro) {
        setSummaryCount((c) => c + 1)
      }
    } catch (err) {
      console.error(err)
      setError("Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="tra-layout">
      {/* Main Column - Guided Reflection */}
      <div className="tra-main-column">
        <div className="tra-section-card">
          <h2 className="tra-section-title">GUIDED REFLECTION</h2>
          <p className="tra-section-body">
            This space is for calm, structured reflection. It does not replace supervision or therapy. 
            Take your time, pause when needed, and use only what feels helpful.
          </p>

          <div className="tra-sections">
            <div>
              <h3 className="tra-section-heading">Start your reflection</h3>
              <p className="tra-section-subtitle">
                Describe the situation, person, or question you'd like to reflect on. 
                The AI will generate a 9-step reflection based on what you write.
              </p>
              
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Write whatever comes up. It doesn't need to be neat or complete."
                className="tra-textarea"
                style={{ minHeight: "120px", marginTop: "8px" }}
              />
            </div>

            <button
              onClick={handleGenerateReflection}
              className="tra-button-primary"
              style={{ width: "100%", marginTop: "10px" }}
            >
              GENERATE 9-STEP REFLECTION
            </button>

            <p className="tra-start-note">
              Your AI-generated 9-step reflection will appear below once you click 'Generate'.
            </p>

            {/* Summary Output */}
            {summary && (
              <div className="tra-ai-summary-box" style={{ marginTop: "12px" }}>
                <div className="tra-ai-summary-header">
                  <h3 className="tra-ai-summary-title">Your Summary</h3>
                  <span className="tra-ai-summary-badge">AI</span>
                </div>
                <p className="tra-ai-summary-text" style={{ whiteSpace: "pre-line" }}>{summary}</p>
              </div>
            )}

            {/* Error display */}
            {error && (
              <p className="tra-ai-status tra-ai-status-error" style={{ marginTop: "8px" }}>
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Side Column - Info Cards */}
      <div className="tra-side-column">
        {/* FREE + OPTIONAL PRO */}
        <div className="tra-side-card">
          <h3 className="tra-section-title">FREE + OPTIONAL PRO</h3>
          <ul className="tra-list">
            <li>9-step model</li>
            <li>{isPro ? "Unlimited AI summaries" : "1 AI summary / day on free tier"}</li>
          </ul>
        </div>

        {/* HOW TO USE THIS SPACE */}
        <div className="tra-side-card">
          <h3 className="tra-section-title">HOW TO USE THIS SPACE</h3>
          <p className="tra-section-body">
            Start by describing the situation, person, or question you want to reflect on in the box on the left. 
            Then click 'Generate' to create your AI-powered 9-step reflection. You can edit any section after it's generated. 
            Move through whichever sections feel helpful. You do not need to fill in every box. Small, honest notes are more useful than perfect paragraphs. 
            This tool was designed by a therapist to help support workers, carers, and overwhelmed adults think things through safely and gently.
          </p>
        </div>

        {/* OPTIONAL AI HELPER */}
        <div className="tra-side-card tra-ai-card">
          <h3 className="tra-section-title">OPTIONAL AI HELPER</h3>
          <p className="tra-section-body">
            Once you've written something in any of the 9 sections, you can ask the AI helper to create a short, structured summary of your reflection.
          </p>
          <ul className="tra-list">
            <li>{isPro ? "Unlimited summaries" : "1 free summary per day from this device"}</li>
            <li>Summarises what you've already written – it doesn't replace your judgement</li>
            <li>Helpful for supervision notes or a quick overview</li>
          </ul>
          <button
            onClick={handleGenerateSummary}
            disabled={isLoading || (!isPro && summaryCount >= FREE_LIMIT)}
            className="tra-button-primary tra-ai-button"
            style={{ marginTop: "8px" }}
          >
            {isLoading ? "GENERATING..." : "GENERATE AI SUMMARY"}
          </button>
          {!isPro && (
            <p className="tra-ai-status tra-ai-status-muted" style={{ marginTop: "6px" }}>
              {Math.max(0, FREE_LIMIT - summaryCount)} free summaries remaining
            </p>
          )}
        </div>

        {/* UNLOCK REFLECTION PRO */}
        <div className="tra-side-card tra-premium-card">
          <h3 className="tra-section-title">UNLOCK REFLECTION PRO £14.99</h3>
          <p className="tra-section-body">
            If this space is helpful and you'd like deeper support, you can unlock Therapy Reflection Pro as a one-off purchase. 
            Pro gives you the full printable pack and the expanded reflective practice workbook.
          </p>
          <div style={{ marginTop: "10px" }}>
            <BuyAccessButton />
          </div>
          <p className="tra-premium-footnote">
            The app will always remain free. Pro is an optional layer for when you want deeper structure, additional AI support, and the full workbook.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TherapyReflectionApp
