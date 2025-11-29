// scripts/demo-reflection.ts
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Sample therapy situation for demo
const SAMPLE_SITUATION = `A 16-year-old client, Sam, has been coming to sessions for 3 months. They've been making progress with anxiety management, but last week they mentioned their parents are going through a divorce. Sam seems withdrawn this session and when asked how they're feeling, they say "fine" but their body language suggests otherwise. They're avoiding eye contact and seem tense.`;

async function demoReflection() {
  console.log("\n🎭 DEMO: 9-Step Reflection Response");
  console.log("=" .repeat(60));
  
  if (!GEMINI_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY not found in .env file");
    console.log("\n💡 Tip: Create a .env file with:");
    console.log("   GEMINI_API_KEY=your_key_here");
    return;
  }

  console.log("\n📝 Sample Situation:");
  console.log("-".repeat(60));
  console.log(SAMPLE_SITUATION);
  console.log("-".repeat(60));

  console.log("\n🤖 Calling Gemini API...");
  console.log("⏳ This may take 10-20 seconds...\n");

  try {
    const FALLBACK_MODELS = [
      "gemini-2.5-flash",
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash"
    ];

    const systemInstruction = "You are a calm therapist creating a 9-part reflection. Reply ONLY with a JSON object with these keys: hypothesis, theme, approaches, theoreticalBase, reasoning, safeguarding, workerReflection, selfCare, claritySnapshot. No markdown.";
    const userPrompt = `Generate reflection for: ${SAMPLE_SITUATION}`;

    let lastError = "";
    let success = false;

    for (const model of FALLBACK_MODELS) {
      try {
        console.log(`   Trying model: ${model}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
        
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.log(`   ❌ ${model} failed: ${response.status}`);
          lastError = `${model}: ${response.status}`;
          continue;
        }

        const data = await response.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const reflection = JSON.parse(cleanJson);

        console.log(`\n✅ Success with model: ${model}\n`);
        console.log("=" .repeat(60));
        console.log("📋 9-STEP REFLECTION RESPONSE:");
        console.log("=" .repeat(60));

        const sections = [
          { key: "hypothesis", label: "1. HYPOTHESIS" },
          { key: "theme", label: "2. THEME" },
          { key: "approaches", label: "3. APPROACHES" },
          { key: "theoreticalBase", label: "4. THEORETICAL BASE" },
          { key: "reasoning", label: "5. REASONING" },
          { key: "safeguarding", label: "6. SAFEGUARDING" },
          { key: "workerReflection", label: "7. WORKER REFLECTION" },
          { key: "selfCare", label: "8. SELF CARE" },
          { key: "claritySnapshot", label: "9. CLARITY SNAPSHOT" },
        ];

        sections.forEach(({ key, label }) => {
          const value = reflection[key] || "[Not provided]";
          console.log(`\n${label}:`);
          console.log("-".repeat(60));
          console.log(value);
        });

        console.log("\n" + "=" .repeat(60));
        console.log("✨ Demo complete!");
        success = true;
        break;

      } catch (e: any) {
        console.log(`   ❌ Error with ${model}: ${e.message}`);
        lastError = e?.message || String(e);
      }
    }

    if (!success) {
      console.error(`\n❌ All models failed. Last error: ${lastError}`);
    }

  } catch (err: any) {
    console.error("\n❌ CRITICAL ERROR:", err.message);
    console.error(err);
  }
}

demoReflection();

