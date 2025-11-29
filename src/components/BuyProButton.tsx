import React, { useState } from "react";

interface BuyProButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export const BuyProButton: React.FC<BuyProButtonProps> = ({ onSuccess, className = "" }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to create checkout session");
      }

      const data = await res.json();
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        className="tra-button-primary"
        onClick={handleBuy}
        disabled={loading}
        style={{ width: "100%" }}
      >
        {loading ? "Redirecting to checkout…" : "Upgrade to Pro – £99"}
      </button>
      {error && (
        <p className="tra-ai-status tra-ai-status-error" style={{ marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  );
};

