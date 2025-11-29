// api/therapy-ai.ts

// -------------------------------------------------------
// ZERO-DEPENDENCY MODE
// This file uses NO external libraries to prevent Vercel 500 startup crashes.
// It uses standard fetch() and process.env.
// -------------------------------------------------------

import type { VercelRequest, VercelResponse } from "@vercel/node"

export const maxDuration = 60; // Allow 60 seconds for AI

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Setup CORS manually (fixes generic network errors)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight OPTIONS check
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. Debugging: Log that the function actually started
  console.log("API Function Started. Method:", req.method);

  // 3. Environment Variable Check
  // We check ALL possible names to be safe
  const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!API_KEY) {
    console.error("CRITICAL: API Key is missing.");
    return res.status(500).json({ 
      error: "Configuration Error: GEMINI_API_KEY is missing in Vercel Settings." 
    });
  }

  try {
    // 4. Safe Body Parsing
    // Sometimes Vercel parses it, sometimes it's a string. We handle both.
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        return res.status(400).json({ error: "Invalid JSON body" });
      }
    }
    
    const text = body?.text || body?.reflection || "";
    const mode = body?.mode || "summary";

    if (!text) {
      return res.status(400).json({ error: "No text provided in request body." });
    }

    console.log(`Processing ${mode} for text length: ${text.length}`);

    // 5. The "Raw Fetch" to Google (No SDKs required)
    // Use gemini-2.5-flash (fast and available) or fallback to gemini-flash-latest
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash"; // Fast and available model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
    console.log(`Using model: ${model}`);

    // Construct the prompt based on mode
    let systemPrompt = "";
    let userPrompt = "";

    if (mode === 'reflection9') {
      systemPrompt = "You are a therapist. Reply ONLY with valid JSON keys: hypothesis, theme, approaches, theoreticalBase, reasoning, safeguarding, workerReflection, selfCare, claritySnapshot.";
      userPrompt = `Analyze this text: ${text}`;
    } else {
      systemPrompt = "You are a helpful summarizer.";
      userPrompt = `Summarize this text: ${text}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
        }],
        generationConfig: {
          temperature: 0.4
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Google API Error:", errText);
      throw new Error(`Google API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    
    // Extract text safely
    let outputText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // If needing JSON (reflection9), parse it
    if (mode === 'reflection9') {
      // Clean markdown code blocks if present
      outputText = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
      try {
        const jsonOutput = JSON.parse(outputText);
        return res.status(200).json({ reflection: jsonOutput });
      } catch (e) {
        console.error("AI JSON Parse Failed", outputText);
        return res.status(500).json({ error: "AI produced invalid JSON", raw: outputText });
      }
    }

    // Default return (summary)
    return res.status(200).json({ summary: outputText });

  } catch (error: any) {
    console.error("Critical Handler Error:", error);
    return res.status(500).json({ 
      error: error.message, 
      stack: error.stack 
    });
  }
}
