-- Example Analytics Queries for Teta Tab5a
-- These are intended to be run in the Supabase SQL Editor or any SQL client connected to your database.

-- 1. Top 10 Most Frequently Used Ingredients
-- This query unnests the 'ingredients' array and counts occurrences of each ingredient.
SELECT
    LOWER(TRIM(ingredient)) as normalized_ingredient,
    COUNT(*) as usage_count
FROM
    recipes,
    UNNEST(ingredients) as ingredient -- Unnest the array into rows
GROUP BY
    normalized_ingredient
ORDER BY
    usage_count DESC
LIMIT 10;

-- Note: For more accurate ingredient counting, you might want to normalize them further
-- (e.g., singular vs. plural, remove extra adjectives) either at insertion time or in the query.


-- 2. Most Generated/Saved Dishes (based on dish_name)
-- This counts how many times each dish_name appears.
-- Assumes dish_name is somewhat standardized by the AI.
SELECT
    dish_name,
    COUNT(*) as generation_count
FROM
    recipes
GROUP BY
    dish_name
ORDER BY
    generation_count DESC
LIMIT 10;

-- 3. Count of Recipes per Dialect/Teta Personality
SELECT
    dialect,
    COUNT(*) as recipe_count
FROM
    recipes
GROUP BY
    dialect
ORDER BY
    recipe_count DESC;

-- 4. Recipes with the Highest 'saved_count'
-- (If you are manually updating `saved_count` or have a mechanism for it)
SELECT
    id,
    dish_name,
    saved_count
FROM
    recipes
ORDER BY
    saved_count DESC
LIMIT 10;

-- 5. Alternatively, to get actual save counts from `user_saved_recipes` table (more accurate)
SELECT
    r.id,
    r.dish_name,
    COUNT(usr.recipe_id) as actual_saves
FROM
    recipes r
JOIN
    user_saved_recipes usr ON r.id = usr.recipe_id
GROUP BY
    r.id, r.dish_name
ORDER BY
    actual_saves DESC
LIMIT 10;


-- 6. User Activity: Users who have saved the most recipes
SELECT
    usr.user_id,
    u.email, -- Assuming you have an 'email' column in auth.users or a public users table
    COUNT(usr.recipe_id) as total_recipes_saved
FROM
    user_saved_recipes usr
JOIN
    auth.users u ON usr.user_id = u.id -- Join with auth.users to get identifiable info if needed
GROUP BY
    usr.user_id, u.email
ORDER BY
    total_recipes_saved DESC
LIMIT 10;
-- Note: Accessing auth.users might require specific permissions or creating a view.
-- If you have a public 'profiles' table linked to auth.users, join with that instead.


-- How to improve analytics:
-- - Normalize ingredient names upon insertion (e.g., all lowercase, singular).
-- - Add a timestamp for when a recipe was generated.
-- - Potentially log search queries or ingredient combinations that don't yield recipes.
-- - For more complex text analysis on 'story' or 'teta_comment', consider Supabase's pg_vector for semantic search or external analytics tools.
