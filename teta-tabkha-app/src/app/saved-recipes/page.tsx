'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';

interface SavedRecipe {
  id: string; // recipe id
  dish_name: string;
  teta_comment: string;
  // Potentially other fields like a snippet of the story or main ingredients
  // For simplicity, keeping it minimal for now.
  // These come directly from the 'recipes' table after the join.
}

export default function SavedRecipesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const protectPageAndFetchRecipes = async () => {
      setIsLoading(true);
      const { user, error: userError } = await getCurrentUser();
      if (userError || !user) {
        setError("Teta says you need to login to see your scrapbook!");
        router.push('/login?message=Please login to view your saved recipes.');
        return;
      }
      setCurrentUser(user);

      // Fetch saved recipes for the current user
      // This requires a join between user_saved_recipes and recipes
      const { data, error: fetchError } = await supabase
        .from('user_saved_recipes')
        .select(`
          recipes (
            id,
            dish_name,
            teta_comment,
            story,
            steps
          )
        `)
        .eq('user_id', user.id);

      setIsLoading(false);

      if (fetchError) {
        console.error("Error fetching saved recipes:", fetchError);
        setError("Teta couldn't find your scrapbook. Maybe the jinn took it?");
        setSavedRecipes([]);
      } else if (data) {
        // The data is an array of objects where each object has a 'recipes' key
        // which is the actual recipe object due to the join select.
        const recipes = data.map(item => item.recipes).filter(Boolean) as SavedRecipe[];
        setSavedRecipes(recipes);
      }
    };

    protectPageAndFetchRecipes();
  }, [router]);

  const handleUnsaveRecipe = async (recipeId: string) => {
    if (!currentUser) return; // Should not happen if page is protected

    // Optimistically update UI, or wait for API response
    setSavedRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));

    const response = await fetch('/api/save-recipe', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${session.access_token}` // If using token-based auth for API
        },
        body: JSON.stringify({ recipe_id: recipeId })
    });

    if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Teta couldn't remove this from your scrapbook.");
        // Re-fetch or revert optimistic update if needed
        // For now, simple alert and local state remains changed.
        alert("Failed to unsave recipe. Please try again.");
    } else {
        // alert("Recipe removed from scrapbook!"); // Or a more subtle notification
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-flour">
        <div className="animate-pulse text-center">
          <span className="text-6xl text-brand-clay" role="img" aria-label="Hourglass">⏳</span>
          <p className="text-brand-clay font-comicNeue mt-2 text-lg">
            Teta is looking for your scrapbook...
          </p>
        </div>
      </div>
    );
  }

  if (error && !currentUser) { // Show error if user couldn't be authenticated for the page
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-flour p-6 text-center">
        <h1 className="text-3xl font-bold text-brand-spice font-amiri mb-4">Access Denied, Ya Habibi!</h1>
        <p className="text-brand-clay font-comicNeue mb-6">{error}</p>
        <Link href="/login" className="bg-brand-spice text-white px-6 py-2 rounded-lg font-comicNeue hover:bg-opacity-80">
            Login to Teta's Kitchen
        </Link>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-brand-flour p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-clay font-amiri">
          Teta's Cherished Scrapbook
        </h1>
        {currentUser && (
          <p className="text-lg text-brand-spice font-comicNeue mt-2">
            Recipes saved by {currentUser.email?.split('@')[0] || 'a beloved grandchild'}.
          </p>
        )}
      </header>

      {error && ( // For errors other than auth, e.g., fetching recipes
         <p className="text-center text-red-500 font-comicNeue bg-red-100 p-3 rounded-md mb-6">{error}</p>
      )}

      {savedRecipes.length === 0 && !isLoading && (
        <div className="text-center p-10 border-2 border-dashed border-brand-clay/50 rounded-lg bg-brand-white/50">
          <p className="text-2xl text-brand-clay font-comicNeue mb-4">
            Your scrapbook is empty, ya weldi/binti!
          </p>
          <p className="text-brand-spice mb-6">
            Go find some delicious wisdom from Teta and save it here.
          </p>
          <Link href="/" className="bg-brand-spice text-white px-6 py-3 rounded-lg font-comicNeue hover:bg-opacity-80 text-lg">
            Ask Teta for a Recipe
          </Link>
        </div>
      )}

      {savedRecipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-brand-white p-6 rounded-lg shadow-lg border border-brand-clay/30 hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-bold font-amiri text-brand-spice mb-2">{recipe.dish_name}</h2>
              <p className="italic text-brand-clay font-comicNeue text-sm mb-4">
                "{recipe.teta_comment || 'Teta always has something wise to say about this one!'}"
              </p>
              {/* Could add a Link to view the full recipe if we create individual recipe pages */}
              {/* <Link href={`/recipe/${recipe.id}`} className="text-brand-green hover:underline font-comicNeue text-sm">
                View Full Recipe
              </Link> */}
              <button
                onClick={() => handleUnsaveRecipe(recipe.id)}
                className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 font-comicNeue text-sm transition-colors"
              >
                Remove from Scrapbook
              </button>
            </div>
          ))}
        </div>
      )}
       <div className="mt-12 text-center">
            <Link href="/" className="text-brand-spice hover:underline font-comicNeue">
                ← Back to Teta's Main Kitchen
            </Link>
        </div>
    </div>
  );
}
