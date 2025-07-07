-- Enable Row Level Security for all tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM public;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM authenticated;

-- RECIPES Table
-- Stores the generated recipes
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    dish_name TEXT NOT NULL,
    ingredients TEXT[] NOT NULL, -- Array of ingredients used
    dialect TEXT, -- e.g., "Khartoum", "Port Sudan" (Teta personality)
    story TEXT,   -- Nostalgic story from Teta
    steps TEXT[] NOT NULL, -- Cooking steps
    teta_comment TEXT, -- A general comment or quote from Teta
    generated_by_user_id UUID REFERENCES auth.users(id) NULL, -- Optional: if we want to track who generated it
    saved_count INT DEFAULT 0 NOT NULL -- How many users have saved this (denormalized, could also be a join)
);

-- Enable Row Level Security for recipes table
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Policies for recipes table:
-- 1. Allow public read access for all recipes
CREATE POLICY "Allow public read access to recipes"
ON recipes
FOR SELECT
TO anon, authenticated
USING (true);

-- 2. Allow authenticated users to insert new recipes (e.g. if they generate one)
CREATE POLICY "Allow authenticated users to insert recipes"
ON recipes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- (Optional) 3. Allow users to update recipes they generated if that's a feature
-- CREATE POLICY "Allow users to update their own generated recipes"
-- ON recipes
-- FOR UPDATE
-- TO authenticated
-- USING (auth.uid() = generated_by_user_id)
-- WITH CHECK (auth.uid() = generated_by_user_id);

-- (Optional) 4. Increment saved_count (this might be better handled by a function or server-side logic when a user saves a recipe)


-- USER_SAVED_RECIPES Table
-- Junction table to link users to their saved recipes (many-to-many)
CREATE TABLE user_saved_recipes (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, recipe_id)
);

-- Enable Row Level Security for user_saved_recipes table
ALTER TABLE user_saved_recipes ENABLE ROW LEVEL SECURITY;

-- Policies for user_saved_recipes table:
-- 1. Allow users to insert their own saved recipes
CREATE POLICY "Allow users to insert their own saved recipes"
ON user_saved_recipes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Allow users to view their own saved recipes
CREATE POLICY "Allow users to view their own saved recipes"
ON user_saved_recipes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Allow users to delete their own saved recipes
CREATE POLICY "Allow users to delete their own saved recipes"
ON user_saved_recipes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_recipes_ingredients ON recipes USING GIN (ingredients);
CREATE INDEX idx_user_saved_recipes_user_id ON user_saved_recipes(user_id);
CREATE INDEX idx_user_saved_recipes_recipe_id ON user_saved_recipes(recipe_id);

-- Function to increment recipe saved_count (Example, might need adjustments or be handled client-side/API route)
-- This is more advanced and might be better handled in API logic after confirming Supabase Edge Functions availability.
-- CREATE OR REPLACE FUNCTION increment_recipe_saved_count()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   UPDATE recipes
--   SET saved_count = saved_count + 1
--   WHERE id = NEW.recipe_id;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER on_user_saved_recipe_insert
-- AFTER INSERT ON user_saved_recipes
-- FOR EACH ROW
-- EXECUTE FUNCTION increment_recipe_saved_count();

-- CREATE OR REPLACE FUNCTION decrement_recipe_saved_count()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   UPDATE recipes
--   SET saved_count = saved_count - 1
--   WHERE id = OLD.recipe_id AND saved_count > 0;
--   RETURN OLD;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER on_user_saved_recipe_delete
-- AFTER DELETE ON user_saved_recipes
-- FOR EACH ROW
-- EXECUTE FUNCTION decrement_recipe_saved_count();


-- Note on `saved_count` in `recipes` table:
-- While the triggers above can automate updating `saved_count`, directly updating it
-- via an API route when a user saves/unsaves a recipe might be simpler to manage
-- and less prone to complex trigger logic, especially if Supabase Edge Functions are used.
-- For now, the column exists, and its update can be handled by API logic.

-- Make sure to enable the UUID extension if not already enabled
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; (Run this if gen_random_uuid() is not found)
-- In Supabase, `gen_random_uuid()` is typically available by default.
-- Also, ensure PostGIS is enabled if you plan to use geographic features (not needed for this schema).

-- After running this schema, go to Authentication > Policies in Supabase dashboard
-- and ensure that policies for `auth.users` allow appropriate access if needed,
-- though default Supabase setup usually handles this for basic auth operations.
-- Also, check the "RLS policies" section for each table in the Supabase Table Editor
-- to confirm they are active and correct.
