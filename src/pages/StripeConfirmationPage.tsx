import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

export const StripeConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    // Unlock Pro immediately
    if (typeof window !== "undefined") {
      localStorage.setItem("tra_pro_unlocked_v1", "true");
      localStorage.setItem("omega_pro_unlimited_summaries", "true");
    }

    // Confetti burst on load - earthy, warm colors
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ["#8B6F47", "#A67C52", "#C4A484", "#D4B896", "#E8D5B7", "#F5E6D3"];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Auto-redirect countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/?pro=1");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleContinue = () => {
    navigate("/?pro=1");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FEF9F5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
          textAlign: "center",
          animation: "fadeIn 0.6s ease-in",
        }}
      >
        {/* Workbook Cover Image - Optional, shows if uploaded */}
        <div style={{ marginBottom: "32px" }}>
          <img
            src="/bonuses/workbook-cover.jpg"
            alt="Advanced Reflective Workbook"
            style={{
              width: "100%",
              maxWidth: "400px",
              height: "auto",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(139, 111, 71, 0.15)",
              border: "1px solid rgba(166, 124, 82, 0.2)",
              display: "block",
              margin: "0 auto",
            }}
            onError={(e) => {
              // Hide if image doesn't exist - page still looks great without it
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* Handwritten-style Title */}
        <h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 400,
            fontFamily: "'Brush Script MT', 'Lucida Handwriting', 'Kalam', cursive",
            color: "#5C4A37",
            margin: "0 0 24px 0",
            lineHeight: 1.2,
            textShadow: "0 2px 4px rgba(139, 111, 71, 0.1)",
          }}
        >
          Welcome to Lifetime Pro!
        </h1>

        {/* Warm Message */}
        <p
          style={{
            fontSize: "1.125rem",
            lineHeight: 1.7,
            color: "#6B5B4A",
            margin: "0 0 40px 0",
            maxWidth: "520px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Thank you! You&apos;ve just unlocked unlimited therapeutic reflections + your full 17-page Advanced
          Reflective Workbook.
        </p>

        {/* Download Button */}
        <a
          href="/bonuses/The Advanced Reflective Workbook- new new.pdf"
          download="The-Advanced-Reflective-Workbook.pdf"
          style={{
            display: "inline-block",
            padding: "16px 32px",
            background: "linear-gradient(135deg, #8B6F47 0%, #A67C52 100%)",
            color: "#FFFFFF",
            textDecoration: "none",
            borderRadius: "8px",
            fontSize: "1.125rem",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(139, 111, 71, 0.3), 0 2px 4px rgba(139, 111, 71, 0.2)",
            transition: "all 0.2s ease",
            marginBottom: "24px",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(139, 111, 71, 0.4), 0 2px 4px rgba(139, 111, 71, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(139, 111, 71, 0.3), 0 2px 4px rgba(139, 111, 71, 0.2)";
          }}
        >
          Download Your Workbook Now
        </a>

        {/* Designer Credit */}
        <p
          style={{
            fontSize: "0.875rem",
            color: "#8B7A6B",
            margin: "24px 0 0 0",
            fontStyle: "italic",
          }}
        >
          Designed by Aoife McDermott • Printable & yours forever
        </p>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          style={{
            marginTop: "40px",
            padding: "12px 24px",
            background: "transparent",
            color: "#8B6F47",
            border: "2px solid #8B6F47",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#8B6F47";
            e.currentTarget.style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#8B6F47";
          }}
        >
          Continue to app {countdown > 0 && `(${countdown}s)`}
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

