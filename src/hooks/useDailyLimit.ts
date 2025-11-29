import { useState, useEffect } from "react";

/**
 * Client-side daily rate limiting hook
 * 
 * NOTE: This is intentionally client-side only. Free users can clear localStorage to bypass,
 * but this is acceptable for now as a soft limit. Pro users bypass this check entirely.
 * 
 * @param feature - Feature identifier ('reflection' | 'summary')
 * @param isPro - Whether user has Pro access (bypasses limit)
 * @returns { isAllowed, useItNow, resetForTesting }
 */
export function useDailyLimit(
  feature: "reflection" | "summary",
  isPro: boolean
): {
  isAllowed: boolean;
  useItNow: () => void;
  resetForTesting: () => void;
} {
  const storageKey = `daily-limit:${feature}`;
  const [isAllowed, setIsAllowed] = useState(true);

  // Check limit on mount and when Pro status changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Pro users bypass limit
    if (isPro) {
      setIsAllowed(true);
      return;
    }

    try {
      const lastDateStr = localStorage.getItem(storageKey);
      if (lastDateStr) {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
        setIsAllowed(lastDateStr !== today);
      } else {
        setIsAllowed(true);
      }
    } catch {
      // ignore localStorage errors, allow by default
      setIsAllowed(true);
    }
  }, [storageKey, isPro]);

  const useItNow = () => {
    if (typeof window === "undefined" || isPro) return;

    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
      localStorage.setItem(storageKey, today);
      setIsAllowed(false);
    } catch {
      // ignore localStorage errors
    }
  };

  const resetForTesting = () => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(storageKey);
      setIsAllowed(true);
    } catch {
      // ignore localStorage errors
    }
  };

  return {
    isAllowed: isPro || isAllowed, // Pro users always allowed
    useItNow,
    resetForTesting,
  };
}

