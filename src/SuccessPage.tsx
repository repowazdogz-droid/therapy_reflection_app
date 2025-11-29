import { useEffect, useState } from "react"

export default function SuccessPage() {
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const key = "omega_pro_unlimited_summaries"
    localStorage.setItem(key, "true")
    setVerified(true)
  }, [])

  return (
    <div className="tra-shell">
      <div className="tra-main">
        <div className="tra-section-card" style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <h1 className="tra-section-title" style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>
            Thank you for your purchase! 🎉
          </h1>
          {verified && (
            <>
              <p className="tra-section-body mb-4">Your PDF is ready to download:</p>
              <a
                href="/products/TheAdvancedReflectiveWorkbook.pdf"
                download
                className="tra-button-primary"
                style={{ textDecoration: "none", display: "inline-block" }}
              >
                DOWNLOAD PDF
              </a>
              <p className="tra-section-body mt-6 text-sm">
                Unlimited summaries are unlocked on this device.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
