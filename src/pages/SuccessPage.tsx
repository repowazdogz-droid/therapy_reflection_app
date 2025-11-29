import { useEffect, useState } from "react"

const PDF_PATH = "/products/The Advanced Reflective Workbook.pdf"
const LOCAL_KEY = "omega_pro_unlimited_summaries"

export function SuccessPage() {
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function run() {
      const params = new URLSearchParams(window.location.search)
      const id = params.get("session_id")

      if (!id) {
        setError("Missing session id")
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/verify-session?session_id=${id}`)
        const data = await res.json()

        if (!data.ok) {
          setError("Could not verify your payment.")
          setLoading(false)
          return
        }

        localStorage.setItem(LOCAL_KEY, "true")
        setVerified(true)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setError("Verification failed.")
        setLoading(false)
      }
    }
    run()
  }, [])

  const handleDownload = () => {
    // Encode the filename for URL (spaces become %20)
    const encodedPath = encodeURI(PDF_PATH)
    const link = document.createElement("a")
    link.href = encodedPath
    link.download = "The Advanced Reflective Workbook.pdf"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading)
    return (
      <main className="tra-shell" style={{ padding: "2rem", textAlign: "center" }}>
        <p className="tra-section-body">Verifying purchase…</p>
      </main>
    )

  if (error)
    return (
      <main className="tra-shell" style={{ padding: "2rem", textAlign: "center" }}>
        <h1 className="tra-section-title">Thank you!</h1>
        <p className="tra-ai-status tra-ai-status-error">{error}</p>
      </main>
    )

  return (
    <main className="tra-shell" style={{ padding: "2rem", textAlign: "center" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h1 className="tra-section-title" style={{ marginBottom: "1rem" }}>
          Thank you for your purchase! 🎉
        </h1>
        <button
          onClick={handleDownload}
          className="tra-button-primary"
          style={{ marginBottom: "1rem" }}
        >
          Download your Workbook
        </button>
        <p className="tra-section-body" style={{ color: "#6b7280", fontSize: "0.875rem" }}>
          Unlimited summaries are now unlocked on this device.
        </p>
      </div>
    </main>
  )
}
