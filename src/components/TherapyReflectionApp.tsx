import { useState, useRef, useEffect } from "react"
import { useOmegaPro } from "../hooks/useOmegaPro"

// Free tier summary limit
const FREE_LIMIT = 3

function TherapyReflectionApp() {
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryCount, setSummaryCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isPro = useOmegaPro()

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

      // Your existing API call logic here
      // Example:
      // const res = await fetch("/api/therapy-ai", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ text: yourReflectionText }),
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
    <div>
      {/* Your existing reflection app content - multi-step form */}
      
      {/* SUMMARY OUTPUT AREA */}
      {summary && (
        <div className="tra-summary-block">
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
  )
}

export default TherapyReflectionApp
