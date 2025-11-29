import type { VercelRequest, VercelResponse } from "@vercel/node"

import { GoogleGenerativeAI } from "@google/generative-ai"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  try {
    const { text, mode } = req.body ?? {}

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing text" })
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY not set in Vercel. Add it in Settings → Environment Variables."
      })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    if (mode === "reflection9") {
      const prompt = `
      Produce a 9-section structured reflective practice analysis from this text:

      "${text}"

      Return exactly this JSON format:
      {
        "reflection": {
          "hypothesis": "",
          "theme": "",
          "approaches": "",
          "theoreticalBase": "",
          "reasoning": "",
          "safeguarding": "",
          "workerReflection": "",
          "selfCare": "",
          "claritySnapshot": ""
        }
      }
      `

      const result = await model.generateContent(prompt)
      const json = JSON.parse(result.response.text())

      return res.status(200).json(json)
    }

    if (mode === "summary") {
      const prompt = `
      Summarise this 9-step reflection into a therapist-style supportive overview:

      "${text}"

      Respond only with JSON:
      { "summary": "..." }
      `

      const result = await model.generateContent(prompt)
      const json = JSON.parse(result.response.text())

      return res.status(200).json(json)
    }

    return res.status(400).json({ error: "Invalid mode provided" })
  } catch (err: any) {
    console.error("AI handler error:", err)
    return res.status(500).json({ 
      error: "Server failed while contacting Gemini. Check logs + your API key."
    })
  }
}
