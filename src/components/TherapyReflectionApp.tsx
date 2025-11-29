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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Guided Reflection */}
      <div className="lg:col-span-2">
        <div className="tra-card">
          <h2 className="tra-section-title mb-4">GUIDED REFLECTION</h2>
          <p className="tra-section-body mb-6">
            This space is for calm, structured reflection. It does not replace supervision or therapy. 
            Take your time, pause when needed, and use only what feels helpful.
          </p>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Start your reflection</h3>
            <p className="tra-section-body text-sm mb-4">
              Describe the situation, person, or question you'd like to reflect on. 
              The AI will generate a 9-step reflection based on what you write.
            </p>
            
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="Write whatever comes up. It doesn't need to be neat or complete."
              className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              style={{ fontFamily: "inherit" }}
            />
          </div>

          <button
            onClick={handleGenerateReflection}
            className="tra-button-primary w-full"
          >
            GENERATE 9-STEP REFLECTION
          </button>

          <p className="tra-section-body text-sm mt-4 text-center">
            Your AI-generated 9-step reflection will appear below once you click 'Generate'.
          </p>

          {/* Summary Output */}
          {summary && (
            <div className="tra-summary-block mt-6">
              <h2 className="tra-summary-title">Your Summary</h2>
              <p className="tra-summary-text whitespace-pre-line">{summary}</p>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Info Cards */}
      <div className="space-y-6">
        {/* FREE + OPTIONAL PRO */}
        <div className="tra-card">
          <h3 className="tra-section-title text-lg mb-3">FREE + OPTIONAL PRO</h3>
          <ul className="tra-section-body text-sm space-y-2">
            <li>• 9-step model</li>
            <li>• 1 AI summary / day on free tier</li>
          </ul>
        </div>

        {/* HOW TO USE THIS SPACE */}
        <div className="tra-card">
          <h3 className="tra-section-title text-lg mb-3">HOW TO USE THIS SPACE</h3>
          <p className="tra-section-body text-sm">
            Start by describing the situation, person, or question you want to reflect on in the box on the left. 
            Then click 'Generate' to create your AI-powered 9-step reflection. You can edit any section after it's generated. 
            Move through whichever sections feel helpful. You do not need to fill in every box. Small, honest notes are more useful than perfect paragraphs. 
            This tool was designed by a therapist to help support workers, carers, and overwhelmed adults think things through safely and gently.
          </p>
        </div>

        {/* OPTIONAL AI HELPER */}
        <div className="tra-card">
          <h3 className="tra-section-title text-lg mb-3">OPTIONAL AI HELPER</h3>
          <p className="tra-section-body text-sm mb-4">
            Once you've written something in any of the 9 sections, you can ask the AI helper to create a short, structured summary of your reflection.
          </p>
          <ul className="tra-section-body text-sm space-y-2 mb-4">
            <li>• {isPro ? "Unlimited summaries" : `1 free summary per day from this device`}</li>
            <li>• Summarises what you've already written – it doesn't replace your judgement</li>
            <li>• Helpful for supervision notes or a quick overview</li>
          </ul>
          <button
            onClick={handleGenerateSummary}
            disabled={isLoading || (!isPro && summaryCount >= FREE_LIMIT)}
            className="tra-button-primary w-full"
          >
            {isLoading ? "Generating..." : "GENERATE AI SUMMARY"}
          </button>
          {!isPro && (
            <p className="tra-section-body text-xs mt-2 text-center">
              {Math.max(0, FREE_LIMIT - summaryCount)} free summaries remaining
            </p>
          )}
        </div>

        {/* UNLOCK REFLECTION PRO */}
        <div className="tra-card">
          <h3 className="tra-section-title text-lg mb-3">UNLOCK REFLECTION PRO £14.99</h3>
          <p className="tra-section-body text-sm mb-4">
            If this space is helpful and you'd like deeper support, you can unlock Therapy Reflection Pro as a one-off purchase. 
            Pro gives you the full printable pack and the expanded reflective practice workbook.
          </p>
          <div className="space-y-2">
            <BuyAccessButton />
          </div>
          <p className="tra-section-body text-xs mt-4">
            The app will always remain free. Pro is an optional layer for when you want deeper structure, additional AI support, and the full workbook.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TherapyReflectionApp
