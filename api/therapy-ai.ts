import type { VercelRequest, VercelResponse } from "@vercel/node"

const GEMINI_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY

// MIRRORING YOUR WORKING APP CONFIGURATION
// We prioritize the models you mentioned: 2.5 and 2.0
const FALLBACK_MODELS = [
  "gemini-2.5-flash",      // Priority 1
  "gemini-2.0-flash-exp",  // Priority 2
  "gemini-1.5-flash"       // Safety Fallback
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS Setup (Essential for Vercel)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  if (!GEMINI_KEY) {
    console.error("❌ CRITICAL: GEMINI_API_KEY is missing in Vercel settings.");
    return res.status(500).json({ error: "Server Configuration Error: API Key Missing" })
  }

  try {
    const rawBody = req.body
    const body = typeof rawBody === "string" ? JSON.parse(rawBody) : (rawBody as any) || {}
    const text = body.text || body.reflection || ""
    const mode = body?.mode === "reflection9" ? "reflection9" : "summary"

    console.log(`Processing ${mode} with models: ${FALLBACK_MODELS.join(", ")}`);

    // --- LOGIC FROM WORKING APP ---
    let systemInstruction = "You are a helpful summarizer.";
    let userPrompt = `Summarize this: ${text}`;

    if (mode === "reflection9") {
      systemInstruction = "You are a calm therapist creating a 9-part reflection. Reply ONLY with a JSON object with these keys: hypothesis, theme, approaches, theoreticalBase, reasoning, safeguarding, workerReflection, selfCare, claritySnapshot. No markdown."
      userPrompt = `Generate reflection for: ${text}`
    }

    // Try models in order
    let lastError = ""
    for (const model of FALLBACK_MODELS) {
      try {
        console.log(`Attempting model: ${model}`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`
        
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          }),
        })

        if (!response.ok) {
           const errText = await response.text();
           console.warn(`Model ${model} failed: ${response.status} - ${errText}`);
           lastError = `${model}: ${response.status} ${errText}`;
           continue; // Try next model
        }

        const data = await response.json()
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
        
        // Success!
        if (mode === "reflection9") {
             const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
             return res.status(200).json({ reflection: JSON.parse(cleanJson) })
        }
        return res.status(200).json({ summary: raw })

      } catch (e: any) {
        console.error(`Error with ${model}:`, e);
        lastError = e?.message || String(e);
      }
    }

    throw new Error(`All models failed. Last error: ${lastError}`);

  } catch (err: any) {
    console.error("🔥 FINAL CRASH:", err)
    return res.status(500).json({ error: err.message || "Internal Server Error" })
  }
}