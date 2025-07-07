'use client'; // This will be a client component due to interactivity

import React, { useState } from 'react';

interface IngredientInputProps {
  onSubmit: (ingredients: string[], dialect: string, filters: { vegan: boolean; quick: boolean; dessert: boolean }) => void;
  isLoading: boolean;
}

const IngredientInput: React.FC<IngredientInputProps> = ({ onSubmit, isLoading }) => {
  const [ingredientsText, setIngredientsText] = useState('');
  const [selectedDialect, setSelectedDialect] = useState('Khartoum'); // Default dialect
  const [isVegan, setIsVegan] = useState(false);
  const [isQuick, setIsQuick] = useState(false);
  const [isDessert, setIsDessert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ingredientsArray = ingredientsText
      .split(',')
      .map(ing => ing.trim())
      .filter(ing => ing.length > 0);

    if (ingredientsArray.length === 0) {
      // TODO: Show some error to the user
      alert("Please enter some ingredients, ya habibi/habibti!");
      return;
    }
    onSubmit(ingredientsArray, selectedDialect, { vegan: isVegan, quick: isQuick, dessert: isDessert });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 p-8 border border-dashed border-brand-clay rounded-lg bg-brand-white/50">
      <h2 className="text-2xl font-bold text-brand-clay mb-4 font-amiri">
        What do you have, ya shatir/shatira?
      </h2>

      <textarea
        value={ingredientsText}
        onChange={(e) => setIngredientsText(e.target.value)}
        placeholder="e.g., onions, lentils, regrets, leftover rice from yesterday..."
        className="w-full p-3 border border-brand-spice rounded-md mb-4 font-comicNeue focus:outline-none focus:ring-2 focus:ring-brand-spice"
        rows={3}
        disabled={isLoading}
      />

      {/* TODO: Implement actual ingredient tag display with shake animation on hover/delete */}
      {/* <div className="flex flex-wrap gap-2 mb-4">
        {ingredientsText.split(',').map(ing => ing.trim()).filter(ing => ing).map(ing => (
          <span key={ing} className="px-3 py-1 bg-brand-spice text-brand-white rounded-full text-sm font-comicNeue group hover:animate-shake cursor-default">
            {ing}
          </span>
        ))}
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="dialect" className="block text-brand-clay mb-1 font-comicNeue font-semibold">
            Which Teta is cooking today?
          </label>
          <select
            id="dialect"
            value={selectedDialect}
            onChange={(e) => setSelectedDialect(e.target.value)}
            className="w-full p-3 border border-brand-spice rounded-md font-comicNeue focus:outline-none focus:ring-2 focus:ring-brand-spice"
            disabled={isLoading}
          >
            <option value="Khartoum">Teta from Khartoum (Sassy & Classic)</option>
            <option value="Port Sudan">Teta from Port Sudan (Coastal Flavors)</option>
            <option value="Darfur">Teta from Darfur (Hearty & Traditional)</option>
            {/* Add more dialects/personalities as developed */}
          </select>
        </div>

        <div>
          <h3 className="text-brand-clay mb-1 font-comicNeue font-semibold">Any special requests?</h3>
          <div className="space-y-1 font-comicNeue mt-2">
            <label className="flex items-center text-brand-clay hover:text-brand-spice cursor-pointer">
              <input
                type="checkbox"
                checked={isVegan}
                onChange={(e) => setIsVegan(e.target.checked)}
                className="mr-2 accent-brand-spice w-4 h-4"
                disabled={isLoading}
              />
              Vegan? Khalas, I’ll adjust.
            </label>
            <label className="flex items-center text-brand-clay hover:text-brand-spice cursor-pointer">
              <input
                type="checkbox"
                checked={isQuick}
                onChange={(e) => setIsQuick(e.target.checked)}
                className="mr-2 accent-brand-spice w-4 h-4"
                disabled={isLoading}
              />
              Quick? You kids always rush.
            </label>
            <label className="flex items-center text-brand-clay hover:text-brand-spice cursor-pointer">
              <input
                type="checkbox"
                checked={isDessert}
                onChange={(e) => setIsDessert(e.target.checked)}
                className="mr-2 accent-brand-spice w-4 h-4"
                disabled={isLoading}
              />
              Dessert? Bas, one piece only!
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-brand-spice text-brand-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-opacity-80 font-comicNeue disabled:opacity-50 flex items-center justify-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Teta is thinking...
          </>
        ) : (
          "Ya Teta, Show Me The Magic! →"
        )}
      </button>
    </form>
  );
};

export default IngredientInput;
