import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return NextResponse.json({
      status: "error",
      message: "GEMINI_API_KEY is not set in .env.local",
      fix: "1. Open .env.local  2. Replace 'your_gemini_api_key_here' with your real key  3. Restart 'npm run dev'"
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent("Say 'API working' and nothing else.");
    const text = result.response.text();
    return NextResponse.json({ status: "ok", message: text, keyPrefix: apiKey.slice(0, 8) + "..." });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ status: "error", message: msg });
  }
}
