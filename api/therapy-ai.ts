import type { VercelRequest, VercelResponse } from "@vercel/node"

const GEMINI_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY

// Default to a valid, widely-available model.
const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL || "gemini-1.5-flash", // Changed to 1.5-flash for stability
  "gemini-1.5-pro",
  "gemini-1.0-pro"
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS & Method Check
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Method not allowed" })
  }

  // 2. Key Check
  if (!GEMINI_KEY) {
    console.error("Missing GEMINI_API_KEY in Vercel Environment Variables")
    return res.status(500).json({
      error: "Server Error: API Key not configured.",
    })
  }

  try {
    // 3. Parse Body
    const rawBody = req.body
    const body = typeof rawBody === "string" ? JSON.parse(rawBody) : (rawBody as any) || {}
    
    const text: string | undefined = body.text || body.reflection || body.combinedText || body.content || body.message

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "No reflection text provided." })
    }

    const mode = body?.mode === "reflection9" ? "reflection9" : "summary"

    // 4. Mode Selection
    if (mode === "reflection9") {
      const systemInstruction = "You are a calm therapist creating a 9-part reflection. Reply ONLY with a JSON object with keys: hypothesis, theme, approaches, theoreticalBase, reasoning, safeguarding, workerReflection, selfCare, claritySnapshot. No markdown formatting."
      
      const userPrompt = `Generate all 9 parts based on this input: ${text}`

      // Loop through models until one works
      let lastError = ""
      for (const model of FALLBACK_MODELS) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`
          
          const completionRes = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstruction }] },
              contents: [{ parts: [{ text: userPrompt }] }],
              generationConfig: { responseMimeType: "application/json" }
            }),
          })

          if (!completionRes.ok) {
            lastError = `Model ${model} failed: ${completionRes.status}`
            continue // Try next model
          }

          const completionJson = await completionRes.json()
          const rawText = completionJson?.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
          const reflection = JSON.parse(rawText)
          
          return res.status(200).json({ reflection }) // Success!
        } catch (e) {
            console.error(e);
            continue;
        }
      }
      throw new Error(`All AI models failed. Last error: ${lastError}`)
    }

    // 5. Summary Mode logic (Simplified for brevity)
    const summaryPrompt = `Summarize this reflection compassionately in 2 paragraphs:\n\n${text}`
    
    // Simple summary fetch
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: summaryPrompt }] }] }),
    })
    
    const data = await response.json()
    const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Could not generate summary."
    
    return res.status(200).json({ summary })

  } catch (err: any) {
    console.error("API Error:", err)
    return res.status(500).json({ error: err.message })
  }
}
