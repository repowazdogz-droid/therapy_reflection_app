import { useState, useRef, useEffect } from "react"
import { useOmegaPro } from "../hooks/useOmegaPro"
import BuyAccessButton from "./BuyAccessButton"

// Free tier summary limit
const FREE_LIMIT = 3

function TherapyReflectionApp() {
  const [summary, setSummary] = useState<string | null>(null)
  const [summaryCount, setSummaryCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isPro = useOmegaPro()

  const ctaRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll when summary appears
  useEffect(() => {
    if (summary && ctaRef.current) {
      setTimeout(() => {
        ctaRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 300)
    }
  }, [summary])

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
      {/* HEADER */}
      <header className="tra-header">
        <h1 className="tra-title">Therapy Reflection</h1>

        {/* PREMIUM BADGE */}
        {isPro && (
          <span className="ml-2 px-2 py-1 text-xs bg-indigo-600 text-white rounded-md">
            PRO
          </span>
        )}
      </header>

      {/* Your existing reflection app content */}
      
      {/* SUMMARY OUTPUT AREA */}
      {summary && (
        <div className="tra-summary-block">
          <h2 className="tra-summary-title">Your Summary</h2>
          <p className="tra-summary-text whitespace-pre-line">{summary}</p>
        </div>
      )}

      {/* BUY CTA (only if NOT pro) */}
      {!isPro && (
        <div ref={ctaRef} className="mt-8">
          <BuyAccessButton />
          <p className="mt-2 text-center text-xs text-gray-500">
            Unlock unlimited summaries + The Advanced Reflective Workbook PDF.
          </p>

          {/* FREE SUMMARY COUNTER */}
          <p className="mt-2 text-center text-xs text-gray-400">
            {Math.max(0, FREE_LIMIT - summaryCount)} free summaries remaining.
          </p>
        </div>
      )}

      {/* Rest of your component */}
    </div>
  )
}

export default TherapyReflectionApp
