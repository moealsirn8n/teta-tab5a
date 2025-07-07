'use client'; // This page is now interactive

import { useState } from 'react';
import IngredientInput from "@/components/IngredientInput";
// import GeneratedRecipe from "@/components/GeneratedRecipe"; // Will create this next

// Define a type for the recipe data we expect
interface RecipeData {
  id?: string; // Optional ID from database
  dish_name: string;
  story: string;
  steps: string[];
  teta_comment: string;
  // Add any other fields returned by the API, like ingredients_received, dialect_received for debugging or display
  ingredients_received?: string[];
  dialect_received?: string;
}

export default function Home() {
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecipeGeneration = async (
    ingredients: string[],
    dialect: string,
    filters: { vegan: boolean; quick: boolean; dessert: boolean }
  ) => {
    setIsLoading(true);
    setError(null);
    setGeneratedRecipe(null); // Clear previous recipe

    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          dialect,
          vegan: filters.vegan,
          quick: filters.quick,
          dessert: filters.dessert,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Teta is not happy... (HTTP ${response.status})`);
      }

      const data: RecipeData = await response.json();
      setGeneratedRecipe(data);

    } catch (err: any) {
      console.error("Error generating recipe:", err);
      setError(err.message || "Something went wrong, Teta is taking an unexpected nap!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadAloud = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any previous speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Attempt to find an Arabic voice or a suitable female voice
      const voices = window.speechSynthesis.getVoices();
      let chosenVoice = voices.find(v => v.lang.startsWith('ar')) || // Arabic voice
                        voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) || // English female
                        voices.find(v => v.name.toLowerCase().includes('female')); // Any female

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }
      utterance.pitch = 0.9; // Slightly lower pitch
      utterance.rate = 0.95;  // Slightly slower rate
      utterance.volume = 1; // Max volume

      // Log available voices for debugging
      // console.log("Available voices:", voices.map(v => ({name: v.name, lang: v.lang, default: v.default })));
      // console.log("Chosen voice:", chosenVoice);

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, Teta's voice can't reach your browser. It doesn't support speech synthesis.");
    }
  };

  const handleSaveRecipe = async (recipeId: string | undefined) => {
    if (!recipeId) {
      setError("Cannot save a recipe without an ID.");
      return;
    }

    // TODO: Check if user is logged in. This will be integrated later.
    // For now, we assume they are, or the API will return 401.

    try {
      const response = await fetch('/api/save-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${session.access_token}` // Pass JWT if available
        },
        body: JSON.stringify({ recipe_id: recipeId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save recipe (HTTP ${response.status})`);
      }

      const result = await response.json();
      alert(result.message || "Recipe saved!"); // Replace with a less intrusive notification
      // TODO: Update UI to reflect saved state, e.g., change button text/icon
    } catch (err: any) {
      console.error("Error saving recipe:", err);
      setError(err.message || "Could not save the recipe to your scrapbook.");
    }
  };


  return (
    <>
      {/* Hero Section */}
      <section className="text-center pt-10 pb-6"> {/* Adjusted padding */}
        <h1 className="text-5xl font-bold mb-4 text-brand-clay font-amiri">
          Teta Tab5a
        </h1>
        <p className="text-xl mb-6 text-brand-spice font-comicNeue">
          Tell Teta what’s in your fridge, she’ll tell you how to fix your life (and dinner).
        </p>
        {/* Removed the static button, IngredientInput component will handle submission trigger */}
      </section>

      <IngredientInput onSubmit={handleRecipeGeneration} isLoading={isLoading} />

      {error && (
        <div className="my-6 p-4 border border-red-500 bg-red-100 text-red-700 rounded-lg text-center font-comicNeue">
          <p className="font-bold font-amiri text-lg">Oh no, ya weldi/binti!</p>
          <p>{error}</p>
        </div>
      )}

      {/* Display area for loading state or the generated recipe */}
      <section className="my-8">
        {isLoading && (
          <div className="p-8 border border-dashed border-brand-clay rounded-lg bg-brand-white/50 text-center">
            <div className="animate-pulse inline-block">
              {/* Simple Jebena/coffee pot unicode character, could be an SVG */}
              <span className="text-6xl text-brand-clay" role="img" aria-label="Coffee pot brewing">☕</span>
            </div>
            <p className="text-brand-clay font-comicNeue mt-2 text-lg">
              Teta is brewing up some wisdom (and a recipe)... Please wait, habibi!
            </p>
          </div>
        )}

        {generatedRecipe && !isLoading && (
          <div className="p-6 md:p-8 border border-brand-clay rounded-lg bg-brand-white shadow-xl transition-all duration-500 ease-in-out transform hover:shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-spice mb-3 font-amiri text-center">
              {generatedRecipe.dish_name}
            </h2>
            <p className="italic text-brand-clay mb-6 font-comicNeue text-center text-lg">
              "{generatedRecipe.teta_comment}"
            </p>

            <div className="mb-6">
              <h3 className="text-xl md:text-2xl font-semibold text-brand-clay mb-2 font-amiri">Teta's Story Time:</h3>
              <p className="text-gray-700 font-comicNeue whitespace-pre-line leading-relaxed">{generatedRecipe.story}</p>
            </div>

            <div>
              <h3 className="text-xl md:text-2xl font-semibold text-brand-clay mb-2 font-amiri">What To Do (Listen Carefully, Ya Shater!):</h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-700 font-comicNeue leading-relaxed">
                {generatedRecipe.steps.map((step, index) => (
                  <li key={index} className="whitespace-pre-line pl-2">{step}</li>
                ))}
              </ol>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-clay/30 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => { /* TODO: Implement regenerate logic */ alert("Regenerate clicked - Teta needs to think again!"); }}
                  className="bg-brand-clay text-brand-white px-5 py-2 rounded-lg hover:bg-opacity-80 font-comicNeue text-sm transition-colors"
                >
                    Regenerate (Teta Not Happy?)
                </button>
                <button
                  onClick={() => { /* TODO: Implement translate logic */ alert("Translate clicked - For the lost cousins!"); }}
                  className="border border-brand-spice text-brand-spice px-5 py-2 rounded-lg hover:bg-brand-spice hover:text-brand-white font-comicNeue text-sm transition-colors"
                >
                    Translate to English
                </button>
                {/* TTS Optional */}
                {/* <button
                  onClick={() => { // TODO: Implement TTS
                  alert("Read Aloud clicked - Listen to Teta's beautiful voice!"); }}
                  className="border border-brand-green text-brand-green px-5 py-2 rounded-lg hover:bg-brand-green hover:text-brand-white font-comicNeue text-sm transition-colors"
                >
                    Read Aloud (Teta’s Voice)
                </button> */}
                {generatedRecipe?.id && ( // Only show save if recipe has an ID (meaning it was saved to DB)
                  <button
                    onClick={() => handleSaveRecipe(generatedRecipe.id)}
                    className="bg-brand-green text-brand-white px-5 py-2 rounded-lg hover:bg-opacity-80 font-comicNeue text-sm transition-colors disabled:opacity-50"
                    // disabled={isSavingRecipe || !currentUser} // Future: disable while saving or if no user
                  >
                    Save to Teta's Scrapbook
                  </button>
                )}
                <button
                  onClick={() => {
                    if (generatedRecipe) {
                      const textToSpeak = `Dish: ${generatedRecipe.dish_name}. Teta's Comment: ${generatedRecipe.teta_comment}. Story: ${generatedRecipe.story}. Steps: ${generatedRecipe.steps.join('. ')}`;
                      handleReadAloud(textToSpeak);
                    }
                  }}
                  className="border border-blue-500 text-blue-500 px-5 py-2 rounded-lg hover:bg-blue-500 hover:text-white font-comicNeue text-sm transition-colors"
                  disabled={!generatedRecipe || isLoading}
                >
                  Read Aloud (Browser Voice)
                </button>
            </div>
          </div>
        )}

        {!isLoading && !generatedRecipe && !error && (
           <div className="my-8 p-8 border-2 border-dashed border-brand-clay/50 rounded-lg bg-brand-white/30 text-center">
            <p className="text-brand-clay/80 font-comicNeue text-xl">
              Your Teta is waiting... <br/> Tell her your ingredients, and she'll cook up a storm (and maybe some advice).
            </p>
          </div>
        )}
      </section>
    </>
  );
}
