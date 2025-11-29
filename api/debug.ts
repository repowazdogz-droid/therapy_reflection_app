// api/debug.ts

import dotenv from 'dotenv';
import handler from './therapy-ai'; // Import from the same folder

dotenv.config();

console.log("\n⚡ STARTING DEBUG TEST...");

// 1. Mock Request
const req = {
  method: 'POST',
  body: {
    text: "I am feeling overwhelmed.",
    mode: "reflection9"
  }
};

// 2. Mock Response
const res = {
  setHeader: () => {},
  status: (code: number) => ({
    json: (data: any) => {
      console.log(`\nHTTP Status: ${code}`);
      if (data.error) {
        console.error("❌ ERROR:", data.error);
        if (data.stack) console.error(data.stack);
      } else {
        console.log("✅ SUCCESS! Payload received:");
        console.log(JSON.stringify(data, null, 2).slice(0, 200) + "..."); 
      }
    }
  })
};

// 3. Run
(async () => {
  if (!handler) { console.error("❌ Handler import failed."); return; }
  await handler(req as any, res as any);
})();

