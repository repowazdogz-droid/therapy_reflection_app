import type { VercelRequest, VercelResponse } from "@vercel/node"

// ============================================
// TO ADD ANOTHER MODEL LATER, JUST DROP THE KEY HERE
// ============================================
// Add your API keys to Vercel Environment Variables:
// - GEMINI_API_KEY
// - ANTHROPIC_API_KEY (for Claude)
// - OPENAI_API_KEY (for GPT-4o-mini)
// - GROK_API_KEY (for Grok-3)
// ============================================

// API Keys - check which ones are available
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const OPENAI_KEY = process.env.OPENAI_API_KEY
const GROK_KEY = process.env.GROK_API_KEY

// Admin check - set ADMIN_EMAIL in Vercel env vars to enable admin badge
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com"

// Cost tracking (per 1M tokens or per request)
// These are approximate costs - check current pricing on each provider's site
const MODEL_COSTS = {
  'gemini-2.5-flash': { input: 0.075, output: 0.30 }, // $0.075/$0.30 per 1M tokens
  'gemini-2.0-flash-exp': { input: 0.075, output: 0.30 },
  'gemini-1.5-flash': { input: 0.075, output: 0.30 },
  'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 }, // $3/$15 per 1M tokens
  'gpt-4o-mini': { input: 0.15, output: 0.60 }, // $0.15/$0.60 per 1M tokens
  'grok-beta': { input: 0.10, output: 0.30 }, // Approximate - check X.ai pricing
}

// Usage tracking (in-memory for now, can be moved to Redis/Upstash later)
interface UsageStats {
  totalRequests: number
  modelUsage: Record<string, { count: number; totalCost: number; avgResponseTime: number }>
  errors: Record<string, number>
  lastUpdated: string
}

let usageStats: UsageStats = {
  totalRequests: 0,
  modelUsage: {},
  errors: {},
  lastUpdated: new Date().toISOString()
}

// Fallback templates (absolute last resort)
const FALLBACK_REFLECTION = {
  hypothesis: "Use this space to write your own thoughts about what might be going on here.",
  theme: "What patterns or themes do you notice?",
  approaches: "What approaches might be supportive, safe, and realistic?",
  theoreticalBase: "What theoretical frameworks or models inform your thinking?",
  reasoning: "Why do these approaches feel appropriate and proportionate?",
  safeguarding: "What safety considerations or boundaries need to be in place?",
  workerReflection: "How is this work landing in your own body, emotions, or thoughts?",
  selfCare: "What self-care actions feel doable after this reflection?",
  claritySnapshot: "Where has your thinking landed for now? What feels clear?"
}

const FALLBACK_SUMMARY = "This reflection explores a complex situation with care and attention. Consider the patterns you've noticed, the approaches that feel grounded, and how you're holding this work. Remember to check in with your own wellbeing and seek supervision if needed."

// Model configuration with fallback chain
interface ModelConfig {
  name: string
  provider: 'gemini' | 'claude' | 'openai' | 'grok'
  key: string | undefined
  enabled: boolean
}

const MODELS: ModelConfig[] = [
  { name: 'gemini-2.5-flash', provider: 'gemini', key: GEMINI_KEY, enabled: !!GEMINI_KEY },
  { name: 'gemini-2.0-flash-exp', provider: 'gemini', key: GEMINI_KEY, enabled: !!GEMINI_KEY },
  { name: 'gemini-1.5-flash', provider: 'gemini', key: GEMINI_KEY, enabled: !!GEMINI_KEY },
  { name: 'claude-3-5-sonnet-20241022', provider: 'claude', key: ANTHROPIC_KEY, enabled: !!ANTHROPIC_KEY },
  { name: 'gpt-4o-mini', provider: 'openai', key: OPENAI_KEY, enabled: !!OPENAI_KEY },
  { name: 'grok-beta', provider: 'grok', key: GROK_KEY, enabled: !!GROK_KEY },
].filter(m => m.enabled) // Only include models with API keys

// Timeout for each model attempt (10 seconds)
const MODEL_TIMEOUT = 10000

// Logging helper
function logUsage(modelName: string, success: boolean, responseTime: number, error?: string, tokens?: { input: number; output: number }) {
  const timestamp = new Date().toISOString()
  
  // Update stats
  usageStats.totalRequests++
  usageStats.lastUpdated = timestamp
  
  if (success) {
    if (!usageStats.modelUsage[modelName]) {
      usageStats.modelUsage[modelName] = { count: 0, totalCost: 0, avgResponseTime: 0 }
    }
    usageStats.modelUsage[modelName].count++
    
    // Estimate cost (rough approximation - ~500 input tokens, ~1000 output tokens per request)
    const estimatedInputTokens = tokens?.input || 500
    const estimatedOutputTokens = tokens?.output || 1000
    const cost = MODEL_COSTS[modelName as keyof typeof MODEL_COSTS]
    if (cost) {
      const inputCost = (estimatedInputTokens / 1_000_000) * cost.input
      const outputCost = (estimatedOutputTokens / 1_000_000) * cost.output
      usageStats.modelUsage[modelName].totalCost += inputCost + outputCost
    }
    
    // Update average response time
    const currentAvg = usageStats.modelUsage[modelName].avgResponseTime
    const count = usageStats.modelUsage[modelName].count
    usageStats.modelUsage[modelName].avgResponseTime = ((currentAvg * (count - 1)) + responseTime) / count
    
    console.log(`✅ [${timestamp}] ${modelName} succeeded in ${responseTime}ms`)
  } else {
    if (!usageStats.errors[modelName]) {
      usageStats.errors[modelName] = 0
    }
    usageStats.errors[modelName]++
    console.error(`❌ [${timestamp}] ${modelName} failed: ${error || 'Unknown error'}`)
  }
  
  // Log summary every 10 requests
  if (usageStats.totalRequests % 10 === 0) {
    console.log(`📊 Usage Summary: ${usageStats.totalRequests} total requests`)
    Object.entries(usageStats.modelUsage).forEach(([model, stats]) => {
      console.log(`   ${model}: ${stats.count} uses, $${stats.totalCost.toFixed(4)} estimated cost, ${stats.avgResponseTime.toFixed(0)}ms avg`)
    })
  }
}

// Call Gemini API
async function callGemini(model: string, systemInstruction: string, userPrompt: string, key: string): Promise<string> {
  const startTime = Date.now()
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), MODEL_TIMEOUT)
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime
    
    if (!response.ok) {
      const errText = await response.text()
      logUsage(model, false, responseTime, `HTTP ${response.status}: ${errText}`)
      throw new Error(`Gemini ${response.status}: ${errText}`)
    }
    
    const data = await response.json()
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
    
    // Estimate tokens (rough: ~4 chars per token)
    const inputTokens = Math.ceil((systemInstruction.length + userPrompt.length) / 4)
    const outputTokens = Math.ceil(result.length / 4)
    
    logUsage(model, true, responseTime, undefined, { input: inputTokens, output: outputTokens })
    return result
  } catch (e: any) {
    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime
    if (e.name === 'AbortError') {
      logUsage(model, false, responseTime, 'Timeout')
      throw new Error('Timeout')
    }
    logUsage(model, false, responseTime, e?.message)
    throw e
  }
}

// Call Claude API
async function callClaude(model: string, systemInstruction: string, userPrompt: string, key: string): Promise<string> {
  const startTime = Date.now()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), MODEL_TIMEOUT)
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 4000,
        system: systemInstruction,
        messages: [{ role: 'user', content: userPrompt }]
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime
    
    if (!response.ok) {
      const errText = await response.text()
      logUsage(model, false, responseTime, `HTTP ${response.status}: ${errText}`)
      throw new Error(`Claude ${response.status}: ${errText}`)
    }
    
    const data = await response.json()
    const result = data.content?.[0]?.text || "{}"
    
    // Claude returns token counts in response
    const inputTokens = data.usage?.input_tokens || Math.ceil((systemInstruction.length + userPrompt.length) / 4)
    const outputTokens = data.usage?.output_tokens || Math.ceil(result.length / 4)
    
    logUsage(model, true, responseTime, undefined, { input: inputTokens, output: outputTokens })
    return result
  } catch (e: any) {
    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime
    if (e.name === 'AbortError') {
      logUsage(model, false, responseTime, 'Timeout')
      throw new Error('Timeout')
    }
    logUsage(model, false, responseTime, e?.message)
    throw e
  }
}

// Call OpenAI API
async function callOpenAI(model: string, systemInstruction: string, userPrompt: string, key: string): Promise<string> {
  const startTime = Date.now()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), MODEL_TIMEOUT)
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime
    
    if (!response.ok) {
      const errText = await response.text()
      logUsage(model, false, responseTime, `HTTP ${response.status}: ${errText}`)
      throw new Error(`OpenAI ${response.status}: ${errText}`)
    }
    
    const data = await response.json()
    const result = data.choices?.[0]?.message?.content || "{}"
    
    // OpenAI returns token counts
    const inputTokens = data.usage?.prompt_tokens || Math.ceil((systemInstruction.length + userPrompt.length) / 4)
    const outputTokens = data.usage?.completion_tokens || Math.ceil(result.length / 4)
    
    logUsage(model, true, responseTime, undefined, { input: inputTokens, output: outputTokens })
    return result
  } catch (e: any) {
    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime
    if (e.name === 'AbortError') {
      logUsage(model, false, responseTime, 'Timeout')
      throw new Error('Timeout')
    }
    logUsage(model, false, responseTime, e?.message)
    throw e
  }
}

// Call Grok API (X/Twitter)
async function callGrok(model: string, systemInstruction: string, userPrompt: string, key: string): Promise<string> {
  const startTime = Date.now()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), MODEL_TIMEOUT)
  
  try {
    // Grok API endpoint (adjust if different)
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime
    
    if (!response.ok) {
      const errText = await response.text()
      logUsage(model, false, responseTime, `HTTP ${response.status}: ${errText}`)
      throw new Error(`Grok ${response.status}: ${errText}`)
    }
    
    const data = await response.json()
    const result = data.choices?.[0]?.message?.content || "{}"
    
    // Estimate tokens (Grok may not return usage)
    const inputTokens = data.usage?.prompt_tokens || Math.ceil((systemInstruction.length + userPrompt.length) / 4)
    const outputTokens = data.usage?.completion_tokens || Math.ceil(result.length / 4)
    
    logUsage(model, true, responseTime, undefined, { input: inputTokens, output: outputTokens })
    return result
  } catch (e: any) {
    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime
    if (e.name === 'AbortError') {
      logUsage(model, false, responseTime, 'Timeout')
      throw new Error('Timeout')
    }
    logUsage(model, false, responseTime, e?.message)
    throw e
  }
}

// Resilient AI call with fallback chain
async function callAIWithFallback(
  systemInstruction: string,
  userPrompt: string,
  mode: 'reflection9' | 'summary'
): Promise<{ result: any; modelUsed: string }> {
  
  if (MODELS.length === 0) {
    console.warn("⚠️ No AI models configured. Using fallback template.")
    return {
      result: mode === 'reflection9' ? FALLBACK_REFLECTION : FALLBACK_SUMMARY,
      modelUsed: 'fallback-template'
    }
  }
  
  let lastError = ""
  
  // Try each model in order
  for (const modelConfig of MODELS) {
    try {
      console.log(`🔄 [${new Date().toISOString()}] Attempting ${modelConfig.name} (${modelConfig.provider})`)
      
      let rawResponse: string
      
      switch (modelConfig.provider) {
        case 'gemini':
          rawResponse = await callGemini(modelConfig.name, systemInstruction, userPrompt, modelConfig.key!)
          break
        case 'claude':
          rawResponse = await callClaude(modelConfig.name, systemInstruction, userPrompt, modelConfig.key!)
          break
        case 'openai':
          rawResponse = await callOpenAI(modelConfig.name, systemInstruction, userPrompt, modelConfig.key!)
          break
        case 'grok':
          rawResponse = await callGrok(modelConfig.name, systemInstruction, userPrompt, modelConfig.key!)
          break
        default:
          throw new Error(`Unknown provider: ${modelConfig.provider}`)
      }
      
      // Parse response
      if (mode === 'reflection9') {
        const cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleanJson)
        
        // Validate structure
        const requiredKeys = ['hypothesis', 'theme', 'approaches', 'theoreticalBase', 'reasoning', 'safeguarding', 'workerReflection', 'selfCare', 'claritySnapshot']
        const hasAllKeys = requiredKeys.every(key => parsed[key] !== undefined)
        
        if (hasAllKeys) {
          console.log(`✅ [${new Date().toISOString()}] Success with ${modelConfig.name}`)
          return { result: parsed, modelUsed: modelConfig.name }
        } else {
          throw new Error('Invalid reflection structure')
        }
      } else {
        // Summary mode
        if (rawResponse && rawResponse.trim().length > 0) {
          console.log(`✅ [${new Date().toISOString()}] Success with ${modelConfig.name}`)
          return { result: rawResponse.trim(), modelUsed: modelConfig.name }
        } else {
          throw new Error('Empty summary response')
        }
      }
      
    } catch (e: any) {
      const errorMsg = e?.message || String(e)
      console.warn(`❌ [${new Date().toISOString()}] ${modelConfig.name} failed: ${errorMsg}`)
      lastError = errorMsg
      // Continue to next model
      continue
    }
  }
  
  // All models failed - use fallback template
  console.warn(`⚠️ [${new Date().toISOString()}] All AI models failed. Using fallback template.`)
  return {
    result: mode === 'reflection9' ? FALLBACK_REFLECTION : FALLBACK_SUMMARY,
    modelUsed: 'fallback-template'
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Admin stats endpoint
  if (req.method === 'GET' && req.url?.includes('stats')) {
    return res.status(200).json({
      stats: usageStats,
      modelsAvailable: MODELS.map(m => m.name),
      modelsEnabled: MODELS.length,
      timestamp: new Date().toISOString()
    })
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const rawBody = req.body
    const body = typeof rawBody === "string" ? JSON.parse(rawBody) : (rawBody as any) || {}
    const text = body.text || body.reflection || ""
    const mode = body?.mode === "reflection9" ? "reflection9" : "summary"
    const userEmail = body?.email || req.headers['x-user-email'] || '' // For admin check

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "No text provided" })
    }

    console.log(`📝 [${new Date().toISOString()}] Processing ${mode} request (${text.length} chars)`)

    // Prepare prompts
    let systemInstruction = "You are a helpful summarizer. Provide a compassionate, structured summary in 2-3 paragraphs.";
    let userPrompt = `Summarize this reflection compassionately:\n\n${text}`;

    if (mode === "reflection9") {
      systemInstruction = "You are a calm therapist creating a 9-part reflection. Reply ONLY with a JSON object with these keys: hypothesis, theme, approaches, theoreticalBase, reasoning, safeguarding, workerReflection, selfCare, claritySnapshot. No markdown."
      userPrompt = `Generate reflection for: ${text}`
    }

    // Call AI with fallback chain
    const { result, modelUsed } = await callAIWithFallback(systemInstruction, userPrompt, mode)

    // Build response
    const response: any = mode === "reflection9" 
      ? { reflection: result }
      : { summary: result }

    // Add admin badge info if user is admin
    if (userEmail === ADMIN_EMAIL || process.env.NODE_ENV === 'development') {
      response._admin = {
        modelUsed: modelUsed,
        modelsAvailable: MODELS.map(m => m.name),
        timestamp: new Date().toISOString(),
        stats: usageStats.modelUsage[modelUsed] || null
      }
    }

    return res.status(200).json(response)

  } catch (err: any) {
    console.error(`🔥 [${new Date().toISOString()}] FINAL CRASH:`, err)
    
    // Last resort fallback
    const mode = (req.body as any)?.mode === "reflection9" ? "reflection9" : "summary"
    const fallbackResult = mode === "reflection9" ? FALLBACK_REFLECTION : FALLBACK_SUMMARY
    
    return res.status(200).json({
      [mode === "reflection9" ? "reflection" : "summary"]: fallbackResult,
      _fallback: true,
      _admin: process.env.NODE_ENV === 'development' ? { error: err.message } : undefined
    })
  }
}
