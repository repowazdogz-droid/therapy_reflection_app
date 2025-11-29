// scripts/local-test.ts

import dotenv from 'dotenv';
import handler from '../api/therapy-ai'; // Adjust path if needed

// Load environment variables from .env
dotenv.config();

console.log("🛠️  Testing API Logic Locally...");
console.log("🔑 Checking Key:", process.env.GEMINI_API_KEY ? "Found" : "MISSING");

// Mock the Vercel Request
const req = {
  method: 'POST',
  body: {
    text: "I am feeling overwhelmed by the workload today.",
    mode: "reflection9"
  }
};

// Mock the Vercel Response
const res = {
  setHeader: (key: string, value: string) => console.log(`[Header] ${key}: ${value}`),
  status: (code: number) => {
    console.log(`\n[Status]: ${code}`);
    return {
      json: (data: any) => {
        console.log("\n[Response Data]:");
        console.dir(data, { depth: null, colors: true });
      },
      end: () => console.log("[End]")
    };
  }
};

// Run the handler
(async () => {
  try {
    await handler(req as any, res as any);
  } catch (error) {
    console.error("CRITICAL CRASH:", error);
  }
})();

