import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

const PDF_PATH = "/bonuses/The-Advanced-Reflective-Workbook.pdf";
const PRO_UNLOCK_KEY = "tra_pro_unlocked_v1";

export const ProSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    // Verify payment
    async function verifyPayment() {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get("session_id");

      if (!sessionId) {
        setError("Missing session ID. Please contact support if you completed payment.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/verify-session?session_id=${sessionId}`);
        const data = await res.json();

        if (!data.ok) {
          setError("Payment verification failed. Please contact support with your session ID.");
          setLoading(false);
          return;
        }

        // Unlock Pro
        if (typeof window !== "undefined") {
          localStorage.setItem(PRO_UNLOCK_KEY, "true");
        }

        setVerified(true);
        setLoading(false);
      } catch (err: any) {
        console.error("Verification error:", err);
        setError("Verification failed. Please contact support.");
        setLoading(false);
      }
    }

    verifyPayment();

    return () => clearInterval(interval);
  }, [location.search]);

  if (loading) {
    return (
      <div className="tra-shell" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="tra-side-card" style={{ maxWidth: 500, textAlign: "center" }}>
          <h2 className="tra-section-title">Verifying your purchase…</h2>
          <p className="tra-section-body">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tra-shell" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="tra-side-card tra-premium-card" style={{ maxWidth: 500, textAlign: "center" }}>
          <h2 className="tra-section-title">Thank you for your purchase!</h2>
          <p className="tra-ai-status tra-ai-status-error" style={{ marginTop: 16 }}>
            {error}
          </p>
          <p className="tra-section-body" style={{ marginTop: 16 }}>
            If you believe this is an error, please contact support with your session ID.
          </p>
          <button
            type="button"
            className="tra-button-primary"
            onClick={() => navigate("/")}
            style={{ marginTop: 20 }}
          >
            Return to App
          </button>
        </div>
      </div>
    );
  }

  if (!verified) {
    return null;
  }

  return (
    <div className="tra-shell" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div className="tra-side-card tra-premium-card tra-pro-card" style={{ maxWidth: 600, width: "100%" }}>
        <h1 className="tra-title" style={{ fontSize: "2rem", marginBottom: 12, textAlign: "center" }}>
          Welcome to Lifetime Pro! 🎉
        </h1>

        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <ul className="tra-list" style={{ listStyle: "none", paddingLeft: 0, textAlign: "left" }}>
            <li style={{ marginBottom: 12, fontSize: "1rem", color: "var(--tra-text-main)" }}>
              ✓ <strong>Unlimited 9-step reflections</strong>
            </li>
            <li style={{ marginBottom: 12, fontSize: "1rem", color: "var(--tra-text-main)" }}>
              ✓ <strong>Unlimited AI summaries</strong>
            </li>
            <li style={{ marginBottom: 12, fontSize: "1rem", color: "var(--tra-text-main)" }}>
              ✓ <strong>The full 17-page Advanced Reflective Workbook</strong>
            </li>
          </ul>
        </div>

        <div style={{ marginTop: 32, marginBottom: 24 }}>
          <a
            href={PDF_PATH}
            download="The-Advanced-Reflective-Workbook.pdf"
            style={{ textDecoration: "none", display: "block" }}
          >
            <button
              type="button"
              className="tra-button-primary"
              style={{
                width: "100%",
                fontSize: "1.1rem",
                padding: "14px 24px",
                fontWeight: 600,
              }}
            >
              Download Your Workbook PDF
            </button>
          </a>
        </div>

        <p className="tra-section-body" style={{ textAlign: "center", marginTop: 24, fontSize: "0.95rem", color: "var(--tra-accent-strong)", fontWeight: 500 }}>
          You just saved £400+ on clinical supervision tools
        </p>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <button
            type="button"
            className="tra-button-secondary"
            onClick={() => navigate("/")}
          >
            Start Using Pro Features
          </button>
        </div>
      </div>
    </div>
  );
};

