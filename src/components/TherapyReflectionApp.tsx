import React, { useEffect, useMemo, useState } from "react"
import { BuyProButton } from "./BuyProButton"
import { useDailyLimit } from "../hooks/useDailyLimit"

type SectionKey =
  | "hypothesis"
  | "theme"
  | "approaches"
  | "theoreticalBase"
  | "reasoning"
  | "safeguarding"
  | "workerReflection"
  | "selfCare"
  | "claritySnapshot"

interface SectionConfig {
  key: SectionKey
  title: string
  subtitle: string
  helper: string
  extraPrompts: string[]
}

const SECTIONS: SectionConfig[] = [
  {
    key: "hypothesis",
    title: "1. Hypothesis",
    subtitle: "What might be going on here?",
    helper: "Briefly describe your best current understanding of what is happening for this person or situation.",
    extraPrompts: [
      "If you zoomed out, what might be driving this behaviour or pattern?",
      "What unmet needs, fears, or pressures might be influencing what you're seeing?",
      "What would this look like if you tried to assume good intent?",
    ],
  },
  {
    key: "theme",
    title: "2. Theme",
    subtitle: "Is there a pattern or theme?",
    helper: "Name any recurring themes, dynamics, or cycles you notice.",
    extraPrompts: [
      "Does this remind you of previous situations with this person or others?",
      "Are there repeating triggers, settings, or relationships that keep showing up?",
      "What feels familiar about this, even if the details are new?",
    ],
  },
  {
    key: "approaches",
    title: "3. Suggested Approaches",
    subtitle: "What might help?",
    helper: "List possible approaches or interventions that might be supportive, safe, and realistic.",
    extraPrompts: [
      "What has helped this person (or similar situations) before?",
      "Which approaches feel grounded, kind, and safe enough to try first?",
      "Is there anything you could remove or simplify to reduce overwhelm?",
    ],
  },
  {
    key: "theoreticalBase",
    title: "4. Theoretical Base",
    subtitle: "What informs your thinking?",
    helper: "Briefly note any relevant models, theories, or frameworks guiding your view.",
    extraPrompts: [
      "Are you drawing on attachment, trauma, CBT, systemic, or other frameworks?",
      "How might regulation, safety, and connection be part of this picture?",
      "Is there any knowledge or lens you're aware of that you're not using yet?",
    ],
  },
  {
    key: "reasoning",
    title: "5. Reason for Choice",
    subtitle: "Why these approaches?",
    helper: "Explain why the approaches you've chosen feel appropriate, safe, and proportionate.",
    extraPrompts: [
      "How do these approaches respect the person's autonomy and dignity?",
      "Why do these options feel safer or more ethical than other paths you considered?",
      "Is anything about your own anxiety or pressure influencing your choices?",
    ],
  },
  {
    key: "safeguarding",
    title: "6. Safeguarding Reflection",
    subtitle: "Safety, risk, and boundaries.",
    helper: "Note any safeguarding concerns, limits, or safety checks you need to hold in mind.",
    extraPrompts: [
      "Are there any immediate risks that need a clear, documented action?",
      "Who else needs to be aware of this, if anyone?",
      "Is there anything that doesn't feel quite right that you'd like to flag or revisit?",
    ],
  },
  {
    key: "workerReflection",
    title: "7. Worker Reflection",
    subtitle: "Your internal response.",
    helper: "How is this situation impacting you emotionally, physically, or cognitively?",
    extraPrompts: [
      "What feelings are you left with after contact with this situation or person?",
      "Are there any signs of overwhelm, frustration, or over-responsibility in you?",
      "What might you need to stay grounded, kind, and within your role?",
    ],
  },
  {
    key: "selfCare",
    title: "8. Self-care Suggestion",
    subtitle: "Looking after you.",
    helper: "Name one or two small, realistic self-care actions you can take.",
    extraPrompts: [
      "What is one tiny thing you can do after this (e.g. drink water, short walk, debrief)?",
      "Who or what could support you in this work so you're not carrying it alone?",
      "What boundary or limit might protect your energy in future similar situations?",
    ],
  },
  {
    key: "claritySnapshot",
    title: "9. Clarity Snapshot",
    subtitle: "Where you are now.",
    helper: "Capture a brief summary of your understanding and next gentle steps.",
    extraPrompts: [
      "If you had to summarise this in three lines, what would they be?",
      "What are the next one or two actions that feel safe and realistic?",
      "What would you like future-you to remember about this reflection?",
    ],
  },
]

type ReflectionState = Record<SectionKey, string>

type SummaryStatus = "idle" | "loading" | "success" | "error" | "rate_limited"

const SUMMARY_STORAGE_KEY = "tra_summary_last_used_v1"
const REFLECTION_STORAGE_KEY = "tra_reflection_state_v1"
const PRO_UNLOCK_KEY = "tra_pro_unlocked_v1"

type SaveStatus = "idle" | "saved"

export const TherapyReflectionApp: React.FC = () => {
  // Start box
  const [startText, setStartText] = useState("")
  const [hasGenerated, setHasGenerated] = useState(false)
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false)
  const [reflectionError, setReflectionError] = useState<string | null>(null)

  // Reflection state
  const [reflection, setReflection] = useState<ReflectionState>(() => {
    const initial: Partial<ReflectionState> = {}
    SECTIONS.forEach((s) => {
      initial[s.key] = ""
    })
    return initial as ReflectionState
  })

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")

  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>(() => {
    const e: Partial<Record<SectionKey, boolean>> = {}
    SECTIONS.forEach((s) => {
      e[s.key] = false
    })
    return e as Record<SectionKey, boolean>
  })

  const handleChange = (key: SectionKey, value: string) => {
    setReflection((prev) => ({ ...prev, [key]: value }))
  }

  const toggleExpanded = (key: SectionKey) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Free vs Pro
  const [isPro, setIsPro] = useState(false)
  const [showWorkbookDetails, setShowWorkbookDetails] = useState(false)

  // Load Pro unlock state (from previous purchase on this device)
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const unlocked = window.localStorage.getItem(PRO_UNLOCK_KEY)
      if (unlocked === "true") {
        setIsPro(true)
      }
    } catch {
      // ignore
    }
  }, [])

  // Daily rate limiting hooks (client-side, zero cost)
  const reflectionLimit = useDailyLimit("reflection", isPro)
  const summaryLimit = useDailyLimit("summary", isPro)


  // Load saved reflection on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(REFLECTION_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<ReflectionState>
      setReflection((prev) => ({ ...prev, ...parsed }))
    } catch {
      // ignore bad or missing data
    }
  }, [])

  // Save reflection whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(REFLECTION_STORAGE_KEY, JSON.stringify(reflection))
      setSaveStatus("saved")
      const timeoutId = window.setTimeout(() => {
        setSaveStatus("idle")
      }, 2500)
      return () => window.clearTimeout(timeoutId)
    } catch {
      // ignore storage failures
    }
  }, [reflection])

  // Unlock Pro manually (local override for users who already bought)
  const handleUnlockProLocal = () => {
    setIsPro(true)
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(PRO_UNLOCK_KEY, "true")
    } catch {
      // ignore
    }
  }
  
  // Combined reflection text (for summary/export)
  const combinedText = useMemo(() => {
    return SECTIONS.map((section) => {
      const value = reflection[section.key]?.trim()
      if (!value) return ""
      return `${section.title}\n${value}`
    })
      .filter(Boolean)
      .join("\n\n")
  }, [reflection])

  // Export actions
  const handleCopy = async () => {
    if (!combinedText) return
    try {
      await navigator.clipboard.writeText(combinedText)
      alert("Reflection copied to clipboard.")
    } catch {
      alert("Could not copy to clipboard. You can still select and copy manually.")
    }
  }

  const handleDownload = () => {
    if (!combinedText) return
    const blob = new Blob([combinedText], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "therapy-reflection.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Generate 9-step reflection via AI
  const handleGenerateReflection = async () => {
    const trimmed = startText.trim()
    if (!trimmed) {
      setReflectionError("Write a brief description of the situation before generating your 9-step reflection.")
      return
    }

    setReflectionError(null)
    setIsGeneratingReflection(true)

    try {
      const res = await fetch("/api/therapy-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, mode: "reflection9" }),
      })

      if (!res.ok) {
        let errorMsg = `API error: ${res.status}`
        try {
          const errorData = await res.json()
          errorMsg = errorData?.error || errorMsg
        } catch (parseErr) {
          // If response isn't JSON, try to get text
          try {
            const errorText = await res.text()
            if (errorText) errorMsg = errorText
          } catch {
            // Keep default error message
          }
        }
        throw new Error(errorMsg)
      }

      const data = (await res.json()) as { reflection?: Partial<Record<SectionKey, string>>; error?: string }

      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.reflection) {
        throw new Error("No reflection data received from API")
      }

      const next: Partial<ReflectionState> = {}
      SECTIONS.forEach((s) => {
        const val = (data.reflection?.[s.key] ?? "").toString().trim()
        next[s.key] = val || ""
      })

      // Check if we got at least some content
      const hasContent = Object.values(next).some((v) => v.trim().length > 0)

      if (!hasContent) {
        throw new Error("AI returned empty reflection sections")
      }

      setReflection((prev) => ({ ...prev, ...(next as ReflectionState) }))
      setHasGenerated(true)
      setReflectionError(null)
      
      // Mark as used AFTER successful generation (for free users only)
      if (!isPro) {
        reflectionLimit.useItNow()
      }
    } catch (err: any) {
      console.error("Generate 9-step reflection error", err)
      let errorMessage = err?.message || "Something went wrong asking the AI to generate your 9-step reflection."
      
      // Handle network errors
      if (err instanceof TypeError && err.message.includes("fetch")) {
        errorMessage = "Unable to connect to the server. Please check your internet connection or try again later."
      }
      
      // Handle common API errors
      if (errorMessage.includes("API key not configured") || errorMessage.includes("GEMINI_API_KEY")) {
        errorMessage = "API key not configured. Please contact support."
      }
      
      setReflectionError(
        errorMessage + " You can still fill the sections manually."
      )
      console.error("Full error details:", err)
      // Still show the layout so user can fill manually
      setHasGenerated(true)
    } finally {
      setIsGeneratingReflection(false)
    }
  }

  // AI summary (1/day free, unlimited on Pro)
  const [summaryText, setSummaryText] = useState("")
  const [summaryStatus, setSummaryStatus] = useState<SummaryStatus>("idle")
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const handleGenerateSummary = async () => {
    if (!combinedText || combinedText.trim().length === 0) {
      setSummaryError("Write at least a few lines in any of the 9 sections before asking for an AI summary.")
      setSummaryStatus("error")
      return
    }

    setSummaryStatus("loading")
    setSummaryError(null)

    try {
      const res = await fetch("/api/therapy-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: combinedText, mode: "summary" }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        const errorMsg = errorData?.error || `API error: ${res.status}`
        throw new Error(errorMsg)
      }

      const data = await res.json()
      const summary = data.summary

      if (!summary || typeof summary !== "string") {
        throw new Error("No summary received from AI.")
      }

      setSummaryText(summary)
      setSummaryStatus("success")
      
      // Mark as used AFTER successful generation (for free users only)
      if (!isPro) {
        summaryLimit.useItNow()
      }
    } catch (err: any) {
      console.error("AI summary error", err)
      setSummaryStatus("error")
      setSummaryError(
        err?.message || "Something went wrong while asking the AI helper. You can still use your written reflection without the summary."
      )
    }
  }
  
  // NOTE: REMOVED REDUNDANT handleUnlockProLocal DECLARATION HERE
  // const handleUnlockProLocal = () => {
  //  setIsPro(true);
  //  if (typeof window !== "undefined") {
  //    window.localStorage.setItem(PRO_UNLOCK_KEY, "true");
  //  }
  // };

  const summaryButtonLabel =
    summaryStatus === "loading"
      ? "Generating summary…"
      : isPro
      ? "Generate AI summary (Pro)"
      : "Generate AI summary"

  // UI
  return (
    <div className="tra-layout">
      {/* MAIN COLUMN */}
      <section className="tra-main-column">
        {/* Start card: single box + Generate */}
        <div className="tra-intro-card">
          <div className="tra-intro-row">
            <div>
              <h2 className="tra-section-title">Guided reflection</h2>
              <p className="tra-section-body">
                This space is for calm, structured reflection. It does not replace supervision or therapy. Take your
                time, pause when needed, and use only what feels helpful.
              </p>

              <h3 className="tra-section-heading" style={{ marginTop: 10 }}>
                Start your reflection
              </h3>
              <p className="tra-section-helper">
                Describe the situation, person, or question you&apos;d like to reflect on. The AI will generate a
                9-step reflection based on what you write.
              </p>
              <textarea
                className="tra-textarea"
                rows={4}
                placeholder="Write whatever comes up. It doesn't need to be neat or complete."
                value={startText}
                onChange={(e) => setStartText(e.target.value)}
                disabled={isGeneratingReflection}
              />
              <div className="tra-actions" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="tra-button-primary"
                  onClick={handleGenerateReflection}
                  disabled={isGeneratingReflection || !startText.trim()}
                >
                  {isGeneratingReflection ? "Generating 9-step reflection…" : "Generate 9-step reflection"}
                </button>
              </div>
              
              {/* Rate limit message and upgrade CTA - shown AFTER successful generation */}
              {reflectionLimit.wasUsedToday && hasGenerated && (
                <div style={{ marginTop: 12 }}>
                  <p className="tra-ai-status tra-ai-status-error" style={{ marginBottom: 8 }}>
                    You&apos;ve used your free 9-step reflection today. Upgrade to Pro for unlimited →
                  </p>
                  <BuyProButton />
                </div>
              )}
              {!hasGenerated && !isGeneratingReflection && (
                <p className="tra-start-note">
                  Your AI-generated 9-step reflection will appear below once you click "Generate".
                </p>
              )}
              {isGeneratingReflection && (
                <p className="tra-start-note">
                  AI is creating your 9-step reflection. This may take a few moments…
                </p>
              )}
              {reflectionError && <p className="tra-ai-status tra-ai-status-error">{reflectionError}</p>}
            </div>

            <div className="tra-intro-tag">
              <span className="tra-intro-tag-label">{isPro ? "Pro unlocked" : "Free + optional Pro"}</span>
              <span className="tra-intro-tag-note">
                9-step model · {isPro ? "unlimited AI summaries" : "1 AI summary / day on free tier"}
              </span>
            </div>
          </div>
        </div>

        {/* 9-step layout – hidden until generated */}
        {hasGenerated && (
          <>
            <div className="tra-sections">
              {SECTIONS.map((section) => (
                <div key={section.key} className="tra-section-card">
                  <div className="tra-section-header">
                    <div>
                      <h3 className="tra-section-heading">{section.title}</h3>
                      <p className="tra-section-subtitle">{section.subtitle}</p>
                    </div>
                  </div>
                  <p className="tra-section-helper">{section.helper}</p>
                  <textarea
                    className="tra-textarea"
                    rows={4}
                    placeholder="Write whatever comes up. It doesn't need to be neat or complete."
                    value={reflection[section.key]}
                    onChange={(e) => handleChange(section.key, e.target.value)}
                  />
                  <button
                    type="button"
                    className="tra-toggle-prompts"
                    onClick={() => toggleExpanded(section.key)}
                  >
                    {expanded[section.key] ? "Hide extra prompts" : "More prompts"}
                  </button>
                  {expanded[section.key] && (
                    <ul className="tra-prompts-list">
                      {section.extraPrompts.map((prompt, idx) => (
                        <li key={idx} className="tra-prompt-item">
                          {prompt}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Export actions */}
            <div className="tra-actions-card">
              <h3 className="tra-section-heading">Export your reflection</h3>
              <p className="tra-section-body">
                You can copy your reflection into notes, supervision records, or a secure system. Please follow your
                organisation's policies when storing sensitive information.
              </p>
              <div className="tra-actions">
                <button
                  type="button"
                  className="tra-button-primary"
                  onClick={handleCopy}
                  disabled={!combinedText}
                >
                  Copy all reflection
                </button>
                <button
                  type="button"
                  className="tra-button-secondary"
                  onClick={handleDownload}
                  disabled={!combinedText}
                >
                  Download as .txt
                </button>
              </div>
              {saveStatus === "saved" && (
                <p className="tra-save-indicator">
                  Saved locally to this browser. You can clear it any time by deleting your text or refreshing.
                </p>
              )}
            </div>

            {/* Your current takeaway */}
            {reflection.claritySnapshot.trim() && (
              <div className="tra-takeaway-card">
                <h3 className="tra-takeaway-title">Your current takeaway</h3>
                <p className="tra-takeaway-body">
                  {reflection.claritySnapshot}
                </p>
                <p className="tra-takeaway-footnote">
                  This isn&apos;t a final answer — just where your thinking has landed for now. You can
                  change your mind later.
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* SIDE COLUMN */}
      <aside className="tra-side-column">
        {/* How to use */}
        <div className="tra-side-card">
          <h2 className="tra-section-title">How to use this space</h2>
          <p className="tra-section-body">
            Start by describing the situation, person, or question you want to reflect on in the box on the left. Then
            click "Generate" to create your AI-powered 9-step reflection.
          </p>
          <p className="tra-section-body">
            You can edit any section after it's generated. Move through whichever sections feel helpful. You do not need
            to fill in every box. Small, honest notes are more useful than perfect paragraphs.
          </p>
          <p className="tra-section-body">
            This tool was designed by a therapist to help support workers, carers, and overwhelmed adults think things
            through safely and gently.
          </p>
        </div>

        {/* AI helper card */}
        <div className="tra-side-card tra-ai-card">
          <h2 className="tra-section-title">Optional AI helper</h2>
          <p className="tra-section-body">
            Once you&apos;ve written something in any of the 9 sections, you can ask the AI helper to create a short,
            structured summary of your reflection.
          </p>
          <ul className="tra-list">
            <li>{isPro ? "Unlimited summaries from this device" : "1 free summary per day from this device"}</li>
            <li>Summarises what you&apos;ve already written – it doesn&apos;t replace your judgement</li>
            <li>Helpful for supervision notes or a quick overview</li>
          </ul>
          <button
            type="button"
            className="tra-button-primary tra-ai-button"
            onClick={handleGenerateSummary}
            disabled={summaryStatus === "loading" || !hasGenerated}
          >
            {summaryButtonLabel}
          </button>
          
          {/* Rate limit message with upgrade CTA - shown AFTER successful generation */}
          {summaryLimit.wasUsedToday && summaryStatus === "success" && (
            <div style={{ marginTop: 12 }}>
              <p className="tra-ai-status tra-ai-status-error" style={{ marginBottom: 8 }}>
                You&apos;ve used your free AI summary today. Upgrade to Pro for unlimited →
              </p>
              <BuyProButton />
            </div>
          )}
          
          {/* Error message */}
          {summaryStatus === "error" && summaryError && (
            <p className="tra-ai-status tra-ai-status-error">{summaryError}</p>
          )}
          
          {/* Loading state */}
          {summaryStatus === "loading" && (
            <p className="tra-ai-status tra-ai-status-muted">Generating your summary…</p>
          )}
          {summaryText && (
            <div className="tra-ai-summary-box">
              <div className="tra-ai-summary-header">
                <span className="tra-ai-summary-title">AI summary of your reflection</span>
                <span className="tra-ai-summary-badge">Supportive overview</span>
              </div>
              <p className="tra-ai-summary-intro">
                Here&apos;s a short, structured snapshot of what you&apos;ve written. Read it slowly and
                notice what feels accurate — and what doesn&apos;t.
              </p>
              <p className="tra-ai-summary-text">{summaryText}</p>
              <p className="tra-ai-status tra-ai-status-muted">
                This is a helper, not a diagnosis. If anything feels off, trust your own sense of the
                situation over the summary.
              </p>
            </div>
          )}
        </div>

{/* Reflection Pro – single £14.99 Stripe offer (FINAL CORRECTED VERSION) */}
<div className="tra-side-card tra-premium-card">
  <h2 className="tra-section-title">Unlock Reflection Pro · £14.99</h2>
  <p className="tra-section-body">
    If this space is helpful and you&apos;d like deeper support, you can unlock Therapy Reflection Pro as a
    one-off purchase. Pro gives you the full printable pack and the expanded reflective practice workbook.
  </p>

  {/* Expandable full workbook details */}
  <button
    type="button"
    className="tra-button-secondary"
    onClick={() => setShowWorkbookDetails((prev) => !prev)}
    style={{ marginBottom: 10 }}
  >
    {showWorkbookDetails ? "Hide what’s included" : "See what’s inside Reflection Pro"}
  </button>

  {showWorkbookDetails && (
    <div className="tra-workbook-details">
      <p className="tra-section-body">
        The <strong>Advanced Reflective Practice Workbook</strong> is a strategic guide for therapists,
        frontline staff, and care professionals designed to transform emotionally complex situations from
        chaos into clear, grounded insights by focusing on <strong>understanding, not fixing</strong>.
      </p>

      <ul className="tra-list">
        <li>
          <strong>The Strategic Intelligence Layer for Compassionate Practice</strong> — a way of thinking
          that centres curiosity over being “right”, helping you hold complexity without burning out.
        </li>
        <li>
          <strong>The Four Lenses</strong> — Attachment, Trauma-Informed, ND-Affirming, and Regulation
          lenses to generate deeper hypotheses about underlying needs.
        </li>
        <li>
          <strong>Behaviour as Communication</strong> — helps you identify the needs, fears, or pressures
          beneath what you&apos;re seeing.
        </li>
        <li>
          <strong>Pattern Mapping & Cycle Interruption Tool</strong> — spot repeating dynamics and find the
          most effective point to interrupt the cycle safely.
        </li>
        <li>
          <strong>9-Step Reflection Model (printable)</strong> — a structured debrief tool for after
          sessions, incidents, or emotionally heavy days.
        </li>
        <li>
          <strong>Worker Self-Care Resets & Micro-Boundaries</strong> — 90-second resets and tiny boundaries
          to protect your energy.
        </li>
        <li>
          <strong>Systemic & integrity prompts</strong> — helps you stay ethical, human, and sustainable in
          pressured environments.
        </li>
      </ul>

      <p className="tra-section-body">
        The core message throughout: <strong>You are not required to fix everything.</strong> Your job is to
        stay steady, kind, and aware — not to carry the whole system alone.
      </p>
    </div>
  )}

  {/* Stripe Checkout */}
  <div className="tra-actions" style={{ marginTop: 12 }}>
    <a
      href="https://YOUR_STRIPE_CHECKOUT_LINK_HERE"
      target="_blank"
      rel="noreferrer"
    >
      <button type="button" className="tra-button-primary">
        Get Reflection Pro – £14.99
      </button>
    </a>
  </div>

  {/* Removed: Local unlock for returning customers */}

  <p className="tra-premium-footnote">
    The app will always remain free. Pro is an optional layer for when you want deeper structure,
    additional AI support, and the full printable workbook pack.
  </p>
</div>

        {/* Dev-only: Reset all daily limits */}
        {process.env.NODE_ENV === "development" && (
          <div className="tra-side-card" style={{ marginTop: 12, opacity: 0.7 }}>
            <button
              type="button"
              className="tra-button-secondary"
              onClick={() => {
                reflectionLimit.resetForTesting()
                summaryLimit.resetForTesting()
              }}
              style={{
                fontSize: "0.75rem",
                padding: "4px 8px",
                width: "100%",
              }}
            >
              Reset all daily limits (dev only)
            </button>
          </div>
        )}
</aside>
</div>
)
}
