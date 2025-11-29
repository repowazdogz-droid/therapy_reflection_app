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
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    })

    if (mode === "reflection9") {
      const prompt = `Produce a 9-section structured reflective practice analysis from this text:

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
}`

      try {
        const result = await model.generateContent(prompt)
        const responseText = result.response.text()
        
        let json: any
        try {
          json = JSON.parse(responseText)
        } catch (parseError) {
          // Try to extract JSON from markdown code blocks if present
          const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                          responseText.match(/(\{[\s\S]*\})/)
          if (jsonMatch) {
            json = JSON.parse(jsonMatch[1])
          } else {
            console.error("Failed to parse JSON. Response:", responseText.substring(0, 500))
            throw new Error("Failed to parse JSON response from Gemini")
          }
        }

        // Validate structure
        if (!json.reflection) {
          console.error("Response missing 'reflection' field. Got:", JSON.stringify(json).substring(0, 500))
          throw new Error("Response missing 'reflection' field")
        }

        return res.status(200).json(json)
      } catch (geminiError: any) {
        console.error("Gemini API error:", geminiError)
        return res.status(500).json({ 
          error: `Gemini API error: ${geminiError.message || "Unknown error"}. Check your API key and try again.`
        })
      }
    }

    if (mode === "summary") {
      const prompt = `Summarise this 9-step reflection into a therapist-style supportive overview:

"${text}"

Respond only with JSON:
{ "summary": "..." }`

      try {
        const result = await model.generateContent(prompt)
        const responseText = result.response.text()
        
        let json: any
        try {
          json = JSON.parse(responseText)
        } catch (parseError) {
          // Try to extract JSON from markdown code blocks if present
          const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                          responseText.match(/(\{[\s\S]*\})/)
          if (jsonMatch) {
            json = JSON.parse(jsonMatch[1])
          } else {
            console.error("Failed to parse JSON. Response:", responseText.substring(0, 500))
            throw new Error("Failed to parse JSON response from Gemini")
          }
        }

        if (!json.summary) {
          console.error("Response missing 'summary' field. Got:", JSON.stringify(json).substring(0, 500))
          throw new Error("Response missing 'summary' field")
        }

        return res.status(200).json(json)
      } catch (geminiError: any) {
        console.error("Gemini API error:", geminiError)
        return res.status(500).json({ 
          error: `Gemini API error: ${geminiError.message || "Unknown error"}. Check your API key and try again.`
        })
      }
    }

    return res.status(400).json({ error: "Invalid mode provided" })
  } catch (err: any) {
    console.error("AI handler error:", err)
    return res.status(500).json({ 
      error: `Server error: ${err.message || "Unknown error"}. Check logs and your API key.`
    })
  }
}
