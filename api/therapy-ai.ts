import type { VercelRequest, VercelResponse } from "@vercel/node";

type SectionKey =
  | "hypothesis"
  | "theme"
  | "approaches"
  | "theoreticalBase"
  | "reasoning"
  | "safeguarding"
  | "workerReflection"
  | "selfCare"
  | "claritySnapshot";

const SECTION_TITLES: Record<SectionKey, string> = {
  hypothesis: "1. Hypothesis",
  theme: "2. Theme",
  approaches: "3. Suggested Approaches",
  theoreticalBase: "4. Theoretical Base",
  reasoning: "5. Reason for Choice",
  safeguarding: "6. Safeguarding Reflection",
  workerReflection: "7. Worker Reflection",
  selfCare: "8. Self-care Suggestion",
  claritySnapshot: "9. Clarity Snapshot",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const text = (body.text ?? "").toString().trim();
    const mode = (body.mode ?? "summary") as "reflection9" | "summary";

    if (!text) {
      return res.status(400).json({
        error: "Please provide some text to reflect on.",
      });
    }

    if (mode === "reflection9") {
      // Simple scaffold: put the starting text into each section to remove friction.
      const reflection: Partial<Record<SectionKey, string>> = {};
      (Object.keys(SECTION_TITLES) as SectionKey[]).forEach((key) => {
        reflection[key] =
          key === "claritySnapshot"
            ? `Current snapshot based on your description:\n\n${text}`
            : `Based on your starting description, this section is ready for you to refine:\n\n${text}`;
      });

      return res.status(200).json({ reflection });
    }

    if (mode === "summary") {
      // Very simple "summary": first ~3 sentences or chopped text.
      const cleaned = text.replace(/\s+/g, " ").trim();
      const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
      const short =
        sentences.length <= 3
          ? cleaned.slice(0, 800)
          : sentences.slice(0, 3).join(" ");

      const summary =
        short.length === 0
          ? "A brief reflection is written, but it's quite short. You can expand a little more before summarising."
          : `Here is a simple overview of what you've written so far:\n\n${short}`;

      return res.status(200).json({ summary });
    }

    // Fallback
    return res.status(400).json({ error: "Unknown mode. Use 'reflection9' or 'summary'." });
  } catch (err: any) {
    console.error("therapy-ai handler error:", err);
    return res.status(500).json({
      error: "Something went wrong generating your helper output. You can still use the reflection sections manually.",
    });
  }
}
