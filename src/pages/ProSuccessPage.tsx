import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";

// Pro authentication check - using localStorage key
const PRO_UNLOCK_KEY = "tra_pro_unlocked_v1";

// PDF path - drop your PDF in public/bonuses/
const PDF_PATH = "/bonuses/The-Advanced-Reflective-Workbook.pdf";
const PDF_COVER_PATH = "/bonuses/cover.jpg"; // Optional - add cover.jpg if you want

export const ProSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Check if user is Pro (authenticated + paid)
    const checkProStatus = async () => {
      // Check localStorage for Pro unlock
      const proUnlocked = typeof window !== "undefined" 
        ? localStorage.getItem(PRO_UNLOCK_KEY) === "true"
        : false;

      // If coming from Stripe checkout, verify payment first
      const params = new URLSearchParams(location.search);
      const sessionId = params.get("session_id");

      if (sessionId && !proUnlocked) {
        // Verify payment with Stripe
        try {
          const res = await fetch(`/api/verify-session?session_id=${sessionId}`);
          const data = await res.json();

          if (data.ok) {
            // Payment verified - unlock Pro
            if (typeof window !== "undefined") {
              localStorage.setItem(PRO_UNLOCK_KEY, "true");
            }
            setIsPro(true);
          } else {
            // Payment not verified
            setIsPro(false);
          }
        } catch (err) {
          console.error("Payment verification error:", err);
          setIsPro(false);
        }
      } else if (proUnlocked) {
        // Already Pro
        setIsPro(true);
      } else {
        // Not Pro - redirect to pricing
        setIsPro(false);
      }

      setIsVerifying(false);
    };

    checkProStatus();
  }, [location.search]);

  useEffect(() => {
    // Redirect non-Pro users to pricing
    if (isPro === false && !isVerifying) {
      navigate("/#/");
      // You can add a pricing route later: navigate("/#/pricing");
    }
  }, [isPro, isVerifying, navigate]);

  useEffect(() => {
    // Confetti explosion on load (only for Pro users)
    if (isPro === true) {
      const duration = 4000;
      const animationEnd = Date.now() + duration;
      const defaults = { 
        startVelocity: 30, 
        spread: 360, 
        ticks: 60, 
        zIndex: 10000,
        colors: ['#8B7355', '#D4A574', '#C9A961', '#A0826D', '#E8D5B7'] // Warm earthy colors
      };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Left side
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        
        // Right side
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isPro]);

  // Show loading state while verifying
  if (isVerifying || isPro === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #f5f1eb 0%, #e8ddd4 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto mb-4"></div>
          <p style={{ color: '#6B5D4F', fontSize: '1rem' }}>Verifying your access...</p>
        </div>
      </div>
    );
  }

  // If not Pro, redirect happens in useEffect above
  if (!isPro) {
    return null;
  }

  return (
    <div 
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{ 
        background: 'linear-gradient(135deg, #f5f1eb 0%, #e8ddd4 50%, #f0e8df 100%)',
        fontFamily: 'system-ui, -apple-system, "SF Pro Text", "Inter", sans-serif'
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4"
            style={{ 
              fontFamily: '"Brush Script MT", "Lucida Handwriting", cursive',
              color: '#5C4A37',
              textShadow: '2px 2px 4px rgba(92, 74, 55, 0.1)',
              lineHeight: '1.2'
            }}
          >
            Welcome to Lifetime Pro!
          </h1>
          <p 
            className="text-xl sm:text-2xl mt-6"
            style={{ color: '#6B5D4F', fontWeight: 400 }}
          >
            You now have unlimited access forever + your clinical bonus below
          </p>
        </div>

        {/* Benefits Checklist */}
        <div 
          className="mb-12 p-8 rounded-2xl shadow-lg"
          style={{ 
            background: '#ffffff',
            border: '2px solid #D4A574',
            boxShadow: '0 10px 30px rgba(92, 74, 55, 0.15)'
          }}
        >
          <ul className="space-y-4">
            {[
              'Unlimited 9-step therapeutic reflections',
              'Unlimited AI clinical summaries',
              'No daily limits ever'
            ].map((benefit, idx) => (
              <li key={idx} className="flex items-start">
                <svg 
                  className="w-6 h-6 mr-4 mt-1 flex-shrink-0" 
                  fill="none" 
                  stroke="#8B7355" 
                  strokeWidth="3" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span style={{ color: '#5C4A37', fontSize: '1.125rem', lineHeight: '1.75' }}>
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* PDF Hero Section */}
        <div 
          className="mb-12 p-8 sm:p-12 rounded-3xl shadow-2xl"
          style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #faf8f5 100%)',
            border: '3px solid #C9A961',
            boxShadow: '0 20px 60px rgba(92, 74, 55, 0.2)'
          }}
        >
          {/* PDF Cover Thumbnail (if cover.jpg exists) */}
          <div className="mb-8 text-center">
            <div 
              className="inline-block p-6 rounded-xl"
              style={{ 
                background: '#f5f1eb',
                border: '2px dashed #D4A574'
              }}
            >
              <div 
                className="w-32 h-40 mx-auto flex items-center justify-center rounded-lg"
                style={{ 
                  background: 'linear-gradient(135deg, #E8D5B7 0%, #D4A574 100%)',
                  boxShadow: '0 8px 20px rgba(92, 74, 55, 0.2)'
                }}
              >
                {PDF_COVER_PATH && (
                  <img 
                    src={PDF_COVER_PATH} 
                    alt="Workbook Cover" 
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      // Hide image if cover.jpg doesn't exist
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                {!PDF_COVER_PATH && (
                  <svg className="w-16 h-16" fill="#8B7355" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="text-center mb-4">
            <a
              href={PDF_PATH}
              download="The-Advanced-Reflective-Workbook.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <button
                className="px-8 py-4 sm:px-12 sm:py-5 text-lg sm:text-xl font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #8B7355 0%, #6B5D4F 100%)',
                  color: '#ffffff',
                  boxShadow: '0 8px 20px rgba(92, 74, 55, 0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(92, 74, 55, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(92, 74, 55, 0.3)';
                }}
              >
                📥 Download The Advanced Reflective Workbook (17-page PDF)
              </button>
            </a>
          </div>

          {/* Small text under button */}
          <p 
            className="text-center text-sm sm:text-base mt-4"
            style={{ color: '#6B5D4F', fontStyle: 'italic' }}
          >
            Designed by Aoife McDermott • £150+ value • Printable & yours forever
          </p>
        </div>

        {/* Additional Bonus Files Section */}
        {/* 
          ============================================
          DROP MORE BONUS FILES HERE
          ============================================
          To add more bonus downloads:
          1. Drop files in public/bonuses/
          2. Copy the card structure below and update:
             - PDF_PATH to your new file path
             - Title and description
             - Optional: Add cover image
          ============================================
        */}
        
        {/* Example template for additional bonuses (commented out):
        <div 
          className="mb-8 p-8 rounded-2xl shadow-lg"
          style={{ 
            background: '#ffffff',
            border: '2px solid #D4A574'
          }}
        >
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#5C4A37' }}>
            Bonus File Name
          </h3>
          <p className="mb-6" style={{ color: '#6B5D4F' }}>
            Description of what this bonus file contains.
          </p>
          <a
            href="/bonuses/your-file.pdf"
            download="your-file.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              className="px-6 py-3 rounded-lg font-semibold"
              style={{
                background: 'linear-gradient(135deg, #8B7355 0%, #6B5D4F 100%)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Download [Filename]
            </button>
          </a>
        </div>
        */}

        {/* Return to App Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 rounded-lg font-semibold transition-all duration-200"
            style={{
              background: 'transparent',
              color: '#8B7355',
              border: '2px solid #D4A574',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f5f1eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Start Using Pro Features →
          </button>
        </div>
      </div>
    </div>
  );
};
