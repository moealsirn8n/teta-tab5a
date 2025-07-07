import { NextResponse } from 'next/server';
// import OpenAI from 'openai'; // Commented out
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const geminiAPIKey = process.env.GEMINI_API_KEY;
if (!geminiAPIKey) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables for Ask Teta.");
}
const genAI = new GoogleGenerativeAI(geminiAPIKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.75, // Slightly higher for more creative/varied advice
    // maxOutputTokens: 300,
  },
   safetySettings: [ // Same safety settings as generate-recipe
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ]
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { question, dialect } = body; // User's question and preferred Teta dialect

    if (!question || typeof question !== 'string' || question.trim() === "") {
      return NextResponse.json({ error: 'A question is required.' }, { status: 400 });
    }

    if (!dialect) {
      dialect = "Khartoum"; // Default dialect if not provided
    }

    const style = "funny, nostalgic, slightly judgmental, wise, loving, sassy";

    let fullPrompt = `You are Teta Tab5a, an AI Sudanese grandma from the ${dialect} region. Your personality is ${style}. You give life advice, often starting with a playful scolding or a cultural idiom, then offering genuine wisdom rooted in Sudanese culture, and perhaps ending with a loving, humorous remark. A user will ask you a question. Respond as Teta, in a VALID JSON format: { "teta_advice": "String", "teta_extra_comment": "String (optional, for an extra humorous closing remark or proverb)" }. Do not include any text outside of this JSON structure, including markdown tags like \`\`\`json.\n\n`;

    fullPrompt += `User's question: "${question}"\n\nProvide your advice now, Teta.`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;

    if (!response || !response.text()) {
        console.error("Gemini response was empty or invalid for Ask Teta:", response);
        throw new Error("AI did not return any content for Ask Teta or the response was invalid.");
    }

    let aiResponseData;
    try {
        let jsonText = response.text();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        } else if (jsonText.startsWith("```")) {
             jsonText = jsonText.substring(3, jsonText.length - 3).trim();
        }
        aiResponseData = JSON.parse(jsonText);
    } catch (e: any) {
        console.error("Failed to parse JSON response from AI for Ask Teta:", response.text(), e);
        throw new Error(`AI returned invalid JSON for Ask Teta. Raw response: ${response.text()}`);
    }

    const { teta_advice, teta_extra_comment } = aiResponseData;

    if (!teta_advice) { // teta_extra_comment is optional
        console.error("AI response missing teta_advice for Ask Teta:", aiResponseData);
        throw new Error("AI response for Ask Teta did not follow the expected JSON structure or teta_advice was missing.");
    }

    const responsePayload = {
        teta_advice,
        teta_extra_comment: teta_extra_comment || null,
        question_received: question,
        dialect_used: dialect,
    };

    return NextResponse.json(responsePayload, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/ask-teta:', error.message, error.stack);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred with Ask Teta.' }, { status: 500 });
  }
}
