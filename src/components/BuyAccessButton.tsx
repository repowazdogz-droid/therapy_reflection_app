import { useState } from "react"

export default function BuyAccessButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBuy() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
      })

      if (!res.ok) {
        throw new Error("Failed to create checkout session")
      }

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
        return
      }

      if (data.id) {
        // fallback older stripe style
        window.location.href = `https://checkout.stripe.com/pay/${data.id}`
        return
      }

      throw new Error("Unexpected Stripe response")
    } catch (err: any) {
      console.error(err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleBuy}
        disabled={loading}
        className="tra-button-primary"
        style={{ width: "100%" }}
      >
        {loading ? "REDIRECTING…" : "GET REFLECTION PRO - £14.99"}
      </button>

      {error && (
        <p className="tra-ai-status tra-ai-status-error" style={{ marginTop: "6px" }}>
          {error}
        </p>
      )}
    </div>
  )
}
