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
  wasUsedToday: boolean; // For showing message after generation
  useItNow: () => void;
  resetForTesting: () => void;
} {
  const storageKey = `daily-limit:${feature}`;
  const [wasUsedToday, setWasUsedToday] = useState(false);

  // Check if already used today on mount and when Pro status changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Pro users never show "used today" message
    if (isPro) {
      setWasUsedToday(false);
      return;
    }

    try {
      const lastDateStr = localStorage.getItem(storageKey);
      if (lastDateStr) {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
        setWasUsedToday(lastDateStr === today);
      } else {
        setWasUsedToday(false);
      }
    } catch {
      // ignore localStorage errors
      setWasUsedToday(false);
    }
  }, [storageKey, isPro]);

  const useItNow = () => {
    if (typeof window === "undefined" || isPro) return;

    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
      localStorage.setItem(storageKey, today);
      setWasUsedToday(true);
    } catch {
      // ignore localStorage errors
    }
  };

  const resetForTesting = () => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(storageKey);
      setWasUsedToday(false);
    } catch {
      // ignore localStorage errors
    }
  };

  return {
    isAllowed: true, // Always allow first click - limit is enforced after generation
    wasUsedToday: !isPro && wasUsedToday, // Only show message for free users who used it today
    useItNow,
    resetForTesting,
  };
}

