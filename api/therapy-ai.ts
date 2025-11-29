// api/therapy-ai.ts

import type { VercelRequest, VercelResponse } from "@vercel/node"

/**
 * REAL AI endpoint using Gemini.
 *
 * Frontend contract:
 *  - POST /api/therapy-ai
 *  - body: { text: string, mode: "reflection9" | "summary" }
 *
 * Response:
 *  - mode "reflection9" -> { reflection: { hypothesis, theme, approaches, theoreticalBase, reasoning, safeguarding, workerReflection, selfCare, claritySnapshot } }
 *  - mode "summary"     -> { summary: string }
 *
 * IMPORTANT:
 *  - Set GEMINI_API_KEY in Vercel → Project → Settings → Environment Variables
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// Minimal REST call to Gemini, no extra npm packages needed
async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it in your Vercel project environment variables."
    )
  }

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" +
    encodeURIComponent(GEMINI_API_KEY)

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Gemini HTTP ${res.status}: ${text || "Unknown error"}`)
  }

  const json: any = await res.json()
  const text =
    json?.candidates?.[0]?.content?.parts?.[0]?.text ??
    json?.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data ??
    ""

  if (!text || typeof text !== "string") {
    throw new Error("Gemini returned no text content.")
  }

  return text
}

// Strip ```json ... ``` wrappers if present
function extractJson(text: string): string {
  const match = text.match(/```json\s*([\s\S]*?)```/i)
  if (match) return match[1].trim()
  // Also try without json tag
  const match2 = text.match(/```\s*([\s\S]*?)```/)
  if (match2) return match2[1].trim()
  return text.trim()
}

async function handleReflection(text: string) {
  const prompt = `
You are a gentle, trauma-informed reflective practice assistant for therapists and support workers.

The user has written the following situation:

---
${text}
---

Your job is to fill out a 9-step reflection model.

You MUST return STRICT JSON ONLY, with this exact structure (no extra keys, no commentary):

{
  "hypothesis": "string",
  "theme": "string",
  "approaches": "string",
  "theoreticalBase": "string",
  "reasoning": "string",
  "safeguarding": "string",
  "workerReflection": "string",
  "selfCare": "string",
  "claritySnapshot": "string"
}

Guidelines:
- Use warm, grounded, non-clinical language.
- Support reflection, do NOT diagnose.
- Keep each field under ~4 short paragraphs.
- Always fill every field, even if you have to be tentative.
`

  const raw = await callGemini(prompt)
  const jsonString = extractJson(raw)

  let parsed: any
  try {
    parsed = JSON.parse(jsonString)
  } catch (err) {
    console.error("Failed to parse Gemini JSON for reflection:", err, jsonString)
    throw new Error("AI returned an invalid format for the 9-step reflection.")
  }

  // Basic sanity guard
  const keys = [
    "hypothesis",
    "theme",
    "approaches",
    "theoreticalBase",
    "reasoning",
    "safeguarding",
    "workerReflection",
    "selfCare",
    "claritySnapshot",
  ]

  const reflection: Record<string, string> = {}
  for (const key of keys) {
    const value = parsed[key]
    reflection[key] =
      typeof value === "string" && value.trim().length > 0
        ? value
        : "Use this space to write your own thoughts here. The AI could not reliably fill this section."
  }

  return { reflection }
}

async function handleSummary(text: string) {
  const prompt = `
You are a gentle reflective practice summariser.

The user has written a 9-step reflection (or part of one):

---
${text}
---

Task:
- Produce a short, structured summary (150–250 words).
- Use calm, non-judgemental language.
- Highlight:
  - key themes
  - working understanding (hypothesis)
  - what might help next
  - any self-care or supervision needs

Return ONLY plain text. No JSON, no bullet syntax, no markdown headings.
`

  const summary = await callGemini(prompt)
  return {
    summary: summary.trim(),
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}
    const { text, mode } = body as { text?: string; mode?: string }

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Missing text" })
    }

    if (mode === "reflection9") {
      const payload = await handleReflection(text)
      return res.status(200).json(payload)
    }

    if (mode === "summary") {
      const payload = await handleSummary(text)
      return res.status(200).json(payload)
    }

    return res.status(400).json({ error: "Invalid mode" })
  } catch (err: any) {
    console.error("therapy-ai handler error:", err)
    const message =
      err?.message ||
      "Something went wrong while talking to the AI. If this keeps happening, please contact support."

    // IMPORTANT: still a 500, but always clean JSON so the frontend can show the message
    return res.status(500).json({ error: message })
  }
}
