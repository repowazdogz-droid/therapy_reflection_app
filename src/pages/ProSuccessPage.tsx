import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";

// Pro authentication check - using localStorage key
const PRO_UNLOCK_KEY = "tra_pro_unlocked_v1";

// PDF path - your PDF is at public/bonuses/The-Advanced-Reflective-Workbook.pdf
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
        // Not Pro - redirect to home (you can add /pricing route later)
        setIsPro(false);
      }

      setIsVerifying(false);
    };

    checkProStatus();
  }, [location.search]);

  useEffect(() => {
    // Redirect non-Pro users
    if (isPro === false && !isVerifying) {
      navigate("/#/");
      // TODO: Add pricing route: navigate("/#/pricing");
    }
  }, [isPro, isVerifying, navigate]);

  useEffect(() => {
    // Confetti burst on load (only for Pro users) - gentle earthy colors
    if (isPro === true) {
      const duration = 4000;
      const animationEnd = Date.now() + duration;
      const defaults = { 
        startVelocity: 25, 
        spread: 360, 
        ticks: 60, 
        zIndex: 10000,
        colors: ['#8B7355', '#A0826D', '#C9A961', '#D4A574', '#E8D5B7', '#B8A082'] // Warm earthy tones
      };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 40 * (timeLeft / duration);
        
        // Left side burst
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        
        // Right side burst
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
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          background: '#FEF9F5',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: '#8B7355' }}
          ></div>
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
      className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ 
        background: '#FEF9F5',
        fontFamily: 'system-ui, -apple-system, "SF Pro Text", "Inter", sans-serif'
      }}
    >
      {/* Decorative leaf/geometric motifs in corners */}
      <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20,30 Q30,20 40,30 T60,30 T80,30" stroke="#8B7355" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <circle cx="30" cy="50" r="8" fill="#A0826D" opacity="0.3"/>
          <path d="M50,70 Q60,60 70,70" stroke="#C9A961" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M80,30 Q70,20 60,30 T40,30 T20,30" stroke="#8B7355" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <circle cx="70" cy="50" r="8" fill="#A0826D" opacity="0.3"/>
          <path d="M50,70 Q40,60 30,70" stroke="#C9A961" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20,70 Q30,80 40,70 T60,70 T80,70" stroke="#8B7355" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <circle cx="30" cy="50" r="8" fill="#A0826D" opacity="0.3"/>
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M80,70 Q70,80 60,70 T40,70 T20,70" stroke="#8B7355" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <circle cx="70" cy="50" r="8" fill="#A0826D" opacity="0.3"/>
        </svg>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6"
            style={{ 
              fontFamily: '"Brush Script MT", "Lucida Handwriting", "Apple Chancery", "Kalam", cursive',
              color: '#5C4A37',
              textShadow: '2px 2px 4px rgba(92, 74, 55, 0.08)',
              lineHeight: '1.1',
              fontWeight: 400
            }}
          >
            Welcome to Lifetime Pro!
          </h1>
          <p 
            className="text-lg sm:text-xl md:text-2xl mt-4 sm:mt-6 px-4"
            style={{ color: '#6B5D4F', fontWeight: 300, lineHeight: '1.5' }}
          >
            Unlimited therapeutic reflections forever + your instant bonus below
          </p>
        </div>

        {/* Benefits Checklist */}
        <div 
          className="mb-10 sm:mb-12 p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg"
          style={{ 
            background: '#ffffff',
            border: '2px solid #E8D5B7',
            boxShadow: '0 8px 24px rgba(92, 74, 55, 0.1)'
          }}
        >
          <ul className="space-y-4 sm:space-y-5">
            {[
              'Unlimited 9-step reflections',
              'Unlimited AI clinical summaries',
              'No daily limits ever'
            ].map((benefit, idx) => (
              <li key={idx} className="flex items-start">
                <svg 
                  className="w-6 h-6 sm:w-7 sm:h-7 mr-4 mt-0.5 flex-shrink-0" 
                  fill="none" 
                  stroke="#8B7355" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span 
                  className="text-base sm:text-lg md:text-xl"
                  style={{ color: '#5C4A37', lineHeight: '1.6', fontWeight: 400 }}
                >
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* PDF Hero Download Card */}
        <div 
          className="mb-10 sm:mb-12 p-6 sm:p-10 md:p-12 rounded-3xl shadow-2xl"
          style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #faf8f5 100%)',
            border: '3px solid #D4A574',
            boxShadow: '0 16px 48px rgba(92, 74, 55, 0.15)'
          }}
        >
          {/* PDF Cover Thumbnail */}
          <div className="mb-8 text-center">
            <div 
              className="inline-block p-4 sm:p-6 rounded-xl"
              style={{ 
                background: '#faf8f5',
                border: '2px dashed #D4A574'
              }}
            >
              <div 
                className="w-24 h-32 sm:w-32 sm:h-40 md:w-40 md:h-52 mx-auto flex items-center justify-center rounded-lg overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, #E8D5B7 0%, #D4A574 100%)',
                  boxShadow: '0 8px 20px rgba(92, 74, 55, 0.2)'
                }}
              >
                {PDF_COVER_PATH ? (
                  <img 
                    src={PDF_COVER_PATH} 
                    alt="Advanced Reflective Workbook Cover" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hide image if cover.jpg doesn't exist
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null}
                {!PDF_COVER_PATH && (
                  <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="#8B7355" viewBox="0 0 24 24" opacity="0.4">
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
              className="inline-block w-full sm:w-auto"
            >
              <button
                className="px-6 py-4 sm:px-10 sm:py-5 md:px-12 md:py-6 text-base sm:text-lg md:text-xl font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 w-full sm:w-auto"
                style={{
                  background: 'linear-gradient(135deg, #8B7355 0%, #6B5D4F 100%)',
                  color: '#ffffff',
                  boxShadow: '0 8px 20px rgba(92, 74, 55, 0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  letterSpacing: '0.3px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(92, 74, 55, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(92, 74, 55, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                📥 Download The Advanced Reflective Workbook (17-page PDF)
              </button>
            </a>
          </div>

          {/* Attribution text */}
          <p 
            className="text-center text-sm sm:text-base mt-4 sm:mt-6"
            style={{ color: '#6B5D4F', fontStyle: 'italic', lineHeight: '1.6' }}
          >
            Designed by Aoife McDermott • £150+ value • Printable & yours forever
          </p>
        </div>

        {/* 
          ============================================
          DROP MORE BONUSES HERE
          ============================================
          Drop more bonus files in /public/bonuses and add download cards here.
          Copy the PDF hero card structure above and update:
          - PDF_PATH to your new file path
          - Title and description
          - Optional: Add cover image
          ============================================
        */}

        {/* Return to App Button */}
        <div className="text-center mt-10 sm:mt-12">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 sm:py-4 rounded-lg font-semibold transition-all duration-200 text-base sm:text-lg"
            style={{
              background: 'transparent',
              color: '#8B7355',
              border: '2px solid #D4A574',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#faf8f5';
              e.currentTarget.style.borderColor = '#8B7355';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#D4A574';
            }}
          >
            Start Using Pro Features →
          </button>
        </div>
      </div>
    </div>
  );
};
