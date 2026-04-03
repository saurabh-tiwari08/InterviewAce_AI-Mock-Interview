import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
    console.error("GEMINI_API_KEY is missing. Add it to .env.local and restart dev server.");
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured. Add it to .env.local and restart the server." },
      { status: 500 }
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const body = await req.json();
    const { role, level, topics, company, history, userAnswer, action } = body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    let prompt = "";

    if (action === "first_question") {
      prompt = `You are an expert technical interviewer at ${company || "a top tech company"}.
You are interviewing a candidate for a ${level} ${role} position.
Topics to cover: ${Array.isArray(topics) ? topics.join(", ") : topics}.

Generate the FIRST interview question. Make it conversational, specific, and appropriate for ${level} level.
Return ONLY the question text. No preamble, no "Question:", no numbering, nothing extra.`;
    }

    else if (action === "followup") {
      const historyText = (history || [])
        .map((h: { role: string; content: string }) =>
          `${h.role === "ai" ? "Interviewer" : "Candidate"}: ${h.content}`
        )
        .join("\n");

      prompt = `You are an expert technical interviewer at ${company || "a top tech company"}.
Interview context: ${level} ${role}, topics: ${Array.isArray(topics) ? topics.join(", ") : topics}

Conversation so far:
${historyText}

The candidate just answered: "${userAnswer}"

Based on their answer, either:
1. Ask a natural follow-up that digs deeper
2. Transition to a related topic from the list
3. Ask a clarifying question if the answer was vague

Be conversational and concise. Return ONLY the next question — no preamble, no numbering.`;
    }

    else if (action === "evaluate") {
      const historyText = (history || [])
        .map((h: { role: string; content: string }) =>
          `${h.role === "ai" ? "Interviewer" : "Candidate"}: ${h.content}`
        )
        .join("\n");

      prompt = `You are an expert technical interviewer. Evaluate this ${level} ${role} interview.

Full conversation:
${historyText}

Provide a detailed evaluation in this EXACT JSON format (no markdown, no backticks, raw JSON only):
{
  "overallScore": 75,
  "summary": "2-3 sentence executive summary here",
  "scores": {
    "technicalDepth": 80,
    "communication": 70,
    "problemSolving": 75,
    "starMethod": 60,
    "confidence": 78
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["area 1", "area 2", "area 3"],
  "questionAnalysis": [
    {
      "question": "question that was asked",
      "quality": "Excellent",
      "feedback": "specific feedback on their answer"
    }
  ],
  "hiringRecommendation": "Yes",
  "nextSteps": "actionable advice here"
}`;
    }

    else {
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    console.log(`Calling Gemini for action: ${action}`);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log(`Gemini responded OK (${text.length} chars)`);

    return NextResponse.json({ content: text });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Gemini API error:", msg);

    if (msg.includes("API_KEY_INVALID") || msg.includes("API key")) {
      return NextResponse.json({ error: "Invalid Gemini API key. Check your .env.local file." }, { status: 401 });
    }
    if (msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
      return NextResponse.json({ error: "Gemini API quota exceeded. Try again in a minute." }, { status: 429 });
    }

    return NextResponse.json({ error: `AI error: ${msg}` }, { status: 500 });
  }
}
