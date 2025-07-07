import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // For saving recipe later
// import OpenAI from 'openai'; // Commented out
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const geminiAPIKey = process.env.GEMINI_API_KEY;
if (!geminiAPIKey) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}
const genAI = new GoogleGenerativeAI(geminiAPIKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest", // Or "gemini-1.5-flash"
  generationConfig: {
    responseMimeType: "application/json", // Request JSON output
    temperature: 0.7,
    // maxOutputTokens: 500, // Adjust as needed
  },
  // Safety settings can be adjusted if needed, though default should be fine.
  // See: https://ai.google.dev/docs/safety_setting_gemini
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ]
});

// Helper function to get current user ID (optional, if you want to associate recipes with users)
async function getUserIdFromRequest(request: Request) {
  // This is a simplified way; in a real app, you might get JWT from Authorization header
  // and verify it, or use Supabase server-side auth helpers if available.
  // For now, let's assume an unauthenticated generation or handle auth elsewhere.
  // const { data: { user } } = await supabase.auth.getUser(); // This might not work server-side without session context
  // return user?.id;
  return null; // Placeholder
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { ingredients, dialect, vegan, quick, dessert } = body;

    // Default values for tone and style, dialect can be part of Teta's persona
    const tone = "Sudanese grandma"; // This is fixed based on the core concept
    const style = "funny, nostalgic, slightly judgmental"; // Core style

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: 'Ingredients are required as a non-empty array.' }, { status: 400 });
    }

    // --- Ingredient Moderation ---
    const lowercasedIngredients = ingredients.map(ing => ing.toLowerCase().trim());
    const bannedWords = ["nothing", "water", "air", "sunshine", "dirt", "rocks"]; // Example list
    const sillyIngredientComments: { [key: string]: string } = {
      "water": "Habibi/Habibti, you want me to teach you how to boil water? Is everything okay at home? Teta is worried now!",
      "nothing": "Nothing? You give Teta NOTHING? What am I, a magician? Go find some real food, ya weldi/binti!",
      "air": "Air? You want to cook with air? Are you a jinn? Teta only cooks food for humans!",
      "regrets": "Ah, 'regrets'... the heaviest ingredient of all. Teta can't cook those away, but a good meal might help you forget them for a while. Now, what actual food do you have?"
    };

    for (const ingredient of lowercasedIngredients) {
      if (bannedWords.includes(ingredient) && sillyIngredientComments[ingredient]) {
        return NextResponse.json({
          dish_name: "Teta's Gentle Scolding",
          story: "A story about a grandchild who tried to be too clever...",
          steps: ["Step 1: Go to the market.", "Step 2: Buy actual food.", "Step 3: Come back and ask Teta again."],
          teta_comment: sillyIngredientComments[ingredient],
          error_type: "silly_ingredient" // Custom error type for client to handle if needed
        }, { status: 400 }); // Bad request due to silly ingredient
      }
      // A more general check for other banned words without specific comments
      if (bannedWords.includes(ingredient)) {
         return NextResponse.json({
          dish_name: "Teta Says No!",
          story: "Some things are not for cooking, ya habibi.",
          steps: ["Listen to your Teta.", "Use proper ingredients next time."],
          teta_comment: `Teta does not cook with '${ingredient}'. Are you playing games with me?`,
          error_type: "banned_ingredient"
        }, { status: 400 });
      }
    }
    // --- End Ingredient Moderation ---


    if (!dialect) {
      // Default dialect if not provided
      dialect = "Khartoum"; // Or pick one randomly, or based on user preference later
    }

    // Construct the prompt for GPT-4o
    // This prompt structure is based on the example in the project brief.
    // We expect the AI to return a JSON object matching the specified output structure.
    // For Gemini, the system prompt often works well as part of the initial user message
    // or as a preamble to the main user query within a single prompt.

    let fullPrompt = `You are Teta Tab5a, an AI Sudanese grandma from the ${dialect} region. Your personality is ${style}. You are wise, loving, a bit sassy, and you express yourself with cultural idioms and playful scolding. A user will provide you with a list of ingredients. Your task is to generate an authentic Sudanese recipe using these ingredients. Include a dish name, a short nostalgic story related to the dish or ingredients, and the cooking steps. Make sure your response is in a VALID JSON format with the following structure: { "dish_name": "String", "story": "String", "steps": ["String", "String", ...], "teta_comment": "String" }. Do not include any text outside of this JSON structure, including markdown tags like \`\`\`json.\n\n`;

    fullPrompt += `User's ingredients: ${ingredients.join(', ')}. User's preferred Teta dialect: ${dialect}.`;
    if (vegan) fullPrompt += " User preference: vegan.";
    if (quick) fullPrompt += " User preference: quick recipe.";
    if (dessert) fullPrompt += " User preference: dessert.";
    fullPrompt += "\n\nGenerate the recipe now.";

    const result = await model.generateContent(fullPrompt);
    const response = result.response;

    if (!response || !response.text()) {
        console.error("Gemini response was empty or invalid:", response);
        throw new Error("AI did not return any content or the response was invalid.");
    }

    let aiResponseData;
    try {
        // Gemini should return a clean JSON string due to responseMimeType.
        // If it includes markdown (```json ... ```), we need to strip it.
        let jsonText = response.text();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        } else if (jsonText.startsWith("```")) {
             jsonText = jsonText.substring(3, jsonText.length - 3).trim();
        }
        aiResponseData = JSON.parse(jsonText);
    } catch (e: any) {
        console.error("Failed to parse JSON response from AI:", response.text(), e);
        throw new Error(`AI returned invalid JSON. Raw response: ${response.text()}`);
    }

    const { dish_name, story, steps, teta_comment } = aiResponseData;

    if (!dish_name || !story || !steps || !teta_comment) {
        console.error("AI response missing required fields after parsing:", aiResponseData);
        throw new Error("AI response did not follow the expected JSON structure, or fields were missing.");
    }

    // --- Database Saving ---
    const generated_by_user_id = await getUserIdFromRequest(request); // Get current user ID if available

    const { data: savedRecipeData, error: dbError } = await supabase
      .from('recipes')
      .insert([{
        dish_name: dish_name,
        ingredients: ingredients, // ingredients from the request
        dialect: dialect,         // dialect from the request or default
        story: story,
        steps: steps,
        teta_comment: teta_comment,
        generated_by_user_id: generated_by_user_id
      }])
      .select()
      .single(); // Assuming we want the single inserted record back

    if (dbError) {
      console.error('Error saving recipe to DB:', dbError.message);
      // Log the error but still return the AI response to the user
      // Alternatively, you could return an error response if DB saving is critical
      // return NextResponse.json({ error: 'Failed to save recipe to database.', details: dbError.message }, { status: 500 });
    }

    // Return the AI-generated recipe content, and optionally the saved DB record or its ID
    const responsePayload = {
        ...aiResponseData, // contains dish_name, story, steps, teta_comment
        id: savedRecipeData?.id, // Add the ID of the saved recipe
        // You might not want to send back the entire savedRecipeData if it's redundant
    };

    return NextResponse.json(responsePayload, { status: 200 });

  } catch (error: any) {
    console.error('Error in /api/generate-recipe:', error.message, error.stack);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
