// scripts/demo-summary.ts
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Sample combined reflection text (what would be generated from the 9 sections)
const SAMPLE_COMBINED_REFLECTION = `
HYPOTHESIS: Sam's withdrawn behavior and avoidance of direct communication likely stem from the emotional impact of their parents' divorce, potentially causing feelings of sadness, confusion, or anger that they are struggling to articulate.

THEME: Family Transition and Emotional Expression: Exploring the impact of parental divorce on adolescent emotional well-being and communication patterns.

APPROACHES: Active Listening: Providing a safe and non-judgmental space for Sam to express their feelings at their own pace. Exploration of Feelings: Gently prompting Sam to identify and name the emotions they are experiencing related to the divorce. Validation: Acknowledging the difficulty of the situation and validating Sam's feelings as normal and understandable. Psychoeducation: Providing age-appropriate information about divorce and its common effects on children and adolescents. Coping Strategies: Collaboratively developing healthy coping mechanisms for managing difficult emotions, such as journaling, mindfulness, or engaging in enjoyable activities. Family Systems Perspective: Considering how the divorce is impacting the entire family dynamic and Sam's role within it.

THEORETICAL BASE: Attachment Theory (Bowlby): Disruption of family structure can trigger attachment insecurities and impact emotional regulation. Family Systems Theory (Bronfenbrenner): Emphasizes the interconnectedness of family members and how changes in one part of the system (e.g., parental divorce) affect the whole. Cognitive Behavioral Therapy (CBT): Identifying and modifying negative thought patterns associated with the divorce to improve emotional well-being.

REASONING: Sam's prior progress with anxiety management suggests a capacity for self-awareness and coping. However, the significant life event of parental divorce is likely overwhelming their existing coping mechanisms, leading to withdrawal and emotional suppression. Addressing the underlying emotions and providing additional support is crucial for preventing potential long-term negative impacts.

SAFEGUARDING: Assess for any indications of self-harm or suicidal ideation related to the divorce. Provide information about crisis resources and encourage Sam to reach out if they are feeling overwhelmed. If there are concerns about Sam's safety or well-being, consult with a supervisor and consider involving relevant authorities (e.g., child protective services) as appropriate, adhering to legal and ethical guidelines.

WORKER REFLECTION: I need to be mindful of my own potential biases or experiences related to divorce, ensuring that I approach Sam's situation with empathy and neutrality. I should also consider consulting with a supervisor to discuss my approach and ensure I am providing the best possible support. It is important to respect Sam's pace and avoid pushing them to disclose more than they are comfortable with.

SELF CARE: After this session, I will engage in a grounding exercise to process any vicarious emotions I may have experienced. I will also schedule a supervision session to discuss my approach and ensure I am providing appropriate support to Sam.

CLARITY SNAPSHOT: Next session, I will gently re-introduce the topic of the divorce, reiterating that Sam can share as much or as little as they feel comfortable with. I will focus on creating a safe space for emotional expression and explore potential coping strategies to help Sam manage their feelings. I will also check in with Sam about their support system and identify any potential resources that could be beneficial.
`;

async function demoSummary() {
  console.log("\n📝 DEMO: AI Summary Response");
  console.log("=" .repeat(60));
  
  if (!GEMINI_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY not found in .env file");
    console.log("\n💡 Tip: Create a .env file with:");
    console.log("   GEMINI_API_KEY=your_key_here");
    return;
  }

  console.log("\n📋 Sample Combined Reflection Text:");
  console.log("-".repeat(60));
  console.log(SAMPLE_COMBINED_REFLECTION.substring(0, 300) + "...");
  console.log("   [Full text truncated for display - summary will use all sections]");
  console.log("-".repeat(60));

  console.log("\n🤖 Calling Gemini API for Summary...");
  console.log("⏳ This may take 10-20 seconds...\n");

  try {
    const FALLBACK_MODELS = [
      "gemini-2.5-flash",
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash"
    ];

    const summaryPrompt = `Summarize this reflection compassionately in 2 paragraphs:\n\n${SAMPLE_COMBINED_REFLECTION}`;

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
            contents: [{ parts: [{ text: summaryPrompt }] }]
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.log(`   ❌ ${model} failed: ${response.status}`);
          lastError = `${model}: ${response.status}`;
          continue;
        }

        const data = await response.json();
        const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary generated.";

        console.log(`\n✅ Success with model: ${model}\n`);
        console.log("=" .repeat(60));
        console.log("✨ AI SUMMARY:");
        console.log("=" .repeat(60));
        console.log("\n" + summary.trim());
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

demoSummary();

