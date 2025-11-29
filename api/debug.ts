// api/debug.ts

import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

(async () => {
  console.log("\n🔍 CHECKING AVAILABLE MODELS...");
  console.log("--------------------------------");

  if (!API_KEY) {
    console.error("❌ CRITICAL: No API Key found in .env");
    return;
  }

  // We query the base 'models' endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      console.error("❌ API ERROR:", data.error.message);
      return;
    }

    if (!data.models) {
      console.log("⚠️  No models returned. Your API Key might be for Vertex AI, not Google AI Studio.");
      return;
    }

    console.log("✅ SUCCESS! Your Key has access to:");
    const names = data.models.map((m: any) => m.name.replace('models/', ''));
    console.log(names);

    console.log("\nRECOMMENDATION:");
    if (names.includes('gemini-1.5-flash')) {
      console.log("👉 Use 'gemini-1.5-flash' (Fast & Cheap)");
    } else if (names.includes('gemini-pro')) {
      console.log("👉 Use 'gemini-pro' (Standard)");
    } else {
      console.log(`👉 Update your code to use: '${names[0]}'`);
    }

  } catch (e) {
    console.error("❌ NETWORK ERROR:", e);
  }
})();
