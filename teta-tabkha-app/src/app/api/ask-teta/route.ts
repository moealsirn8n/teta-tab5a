import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    // Personality traits for Teta (can be adjusted or made dynamic)
    const style = "funny, nostalgic, slightly judgmental, wise, loving, sassy";

    const systemPrompt = `You are Teta Tab5a, an AI Sudanese grandma from the ${dialect} region. Your personality is ${style}. You give life advice, often starting with a playful scolding or a cultural idiom, then offering genuine wisdom rooted in Sudanese culture, and perhaps ending with a loving, humorous remark. A user will ask you a question. Respond as Teta, in a JSON format: { "teta_advice": "String", "teta_extra_comment": "String (optional)" }.`;

    const userMessageContent = `Ya Teta, I have a question for you: "${question}"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessageContent }
      ],
      temperature: 0.75, // Slightly higher for more creative/varied advice
      // max_tokens: 300,
    });

    let aiResponseData;
    if (completion.choices[0].message.content) {
      aiResponseData = JSON.parse(completion.choices[0].message.content);
    } else {
      throw new Error("AI did not return content for Ask Teta.");
    }

    const { teta_advice, teta_extra_comment } = aiResponseData;

    if (!teta_advice) {
        console.error("AI response missing teta_advice:", aiResponseData);
        throw new Error("AI response for Ask Teta did not follow the expected JSON structure.");
    }

    const responsePayload = {
        teta_advice,
        teta_extra_comment: teta_extra_comment || null, // Ensure it's null if not provided
        question_received: question,
        dialect_used: dialect,
    };

    return NextResponse.json(responsePayload, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/ask-teta:', error.message, error.stack);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred with Ask Teta.' }, { status: 500 });
  }
}
