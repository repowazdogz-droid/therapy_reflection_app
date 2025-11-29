// scripts/local-test.ts

import dotenv from 'dotenv';
import handler from '../api/therapy-ai'; // Importing the API handler

// Load environment variables
dotenv.config();

console.log("\n🛠️  STARTING LOCAL TEST...");

// 1. Check API Key
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
console.log("🔑 API Key Status:", apiKey ? "✅ Found" : "❌ MISSING (Check .env file)");

// 2. Mock Request
const req = {
  method: 'POST',
  body: {
    text: "I am feeling overwhelmed by the workload today.",
    mode: "reflection9"
  }
};

// 3. Mock Response
const res = {
  setHeader: () => {},
  status: (code: number) => {
    console.log(`\nHTTP Status: ${code}`);
    return {
      json: (data: any) => {
        console.log("📦 Response Data:");
        console.dir(data, { depth: null, colors: true });
        
        if (data.error) {
            console.log("\n❌ TEST FAILED: API returned an error.");
        } else {
            console.log("\n✅ TEST PASSED: Logic is working!");
        }
      },
      end: () => {}
    };
  }
};

// 4. Run Handler
(async () => {
  try {
    await handler(req as any, res as any);
  } catch (error) {
    console.error("\n❌ CRITICAL CRASH:", error);
  }
})();
