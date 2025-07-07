import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipe_id } = body;

    if (!recipe_id) {
      return NextResponse.json({ error: 'Recipe ID is required.' }, { status: 400 });
    }

    // 1. Get the current authenticated user
    //    For server-side API routes, getting the user needs careful handling.
    //    The client should send its JWT in the Authorization header.
    //    Supabase client on the server can then use this token to get the user.

    //    A more robust way for Next.js API routes with Supabase:
    //    Create a server-side Supabase client specifically for route handlers.
    //    This often involves passing the JWT from the client's Authorization header.
    //    See: https://supabase.com/docs/guides/auth/server-side/nextjs

    //    Simplified approach for now: Attempt to get user from a cookie-based session if available.
    //    This might not be the most secure or standard way for stateless API routes.
    //    The frontend should ensure it only calls this if a user is logged in.

    let user_id = null;
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
        console.error('Error getting session or no session:', sessionError?.message);
        // If using Authorization header, this would be where you check that.
        // For now, we rely on the cookie session.
        return NextResponse.json({ error: 'User not authenticated or session expired.' }, { status: 401 });
    }
    user_id = session.user.id;

    if (!user_id) {
        return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
    }

    // 2. Check if the recipe already saved by the user to prevent duplicates
    //    (Or handle this with a PRIMARY KEY constraint (user_id, recipe_id) which is already in schema)
    const { data: existingSave, error: selectError } = await supabase
      .from('user_saved_recipes')
      .select('*')
      .eq('user_id', user_id)
      .eq('recipe_id', recipe_id)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116: "Searched for a single row, but found no rows" (which is fine for checking existence)
        console.error('Error checking for existing saved recipe:', selectError.message);
        return NextResponse.json({ error: 'Database error checking saved recipe.', details: selectError.message }, { status: 500 });
    }

    if (existingSave) {
      return NextResponse.json({ message: 'Recipe already saved by this user.' }, { status: 200 }); // Or 409 Conflict
    }

    // 3. Save the recipe to user_saved_recipes table
    const { error: insertError } = await supabase
      .from('user_saved_recipes')
      .insert({
        user_id: user_id,
        recipe_id: recipe_id,
      });

    if (insertError) {
      console.error('Error saving recipe for user:', insertError.message);
      // Check for specific errors, e.g., foreign key violation if recipe_id is invalid
      if (insertError.code === '23503') { // foreign_key_violation
        return NextResponse.json({ error: 'Invalid recipe ID.' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to save recipe.', details: insertError.message }, { status: 500 });
    }

    // Optionally, increment saved_count on recipes table.
    // This can be done via a Supabase function/trigger or another call here.
    // For simplicity, omitting direct increment here and relying on RLS for `user_saved_recipes`.
    // const { error: updateCountError } = await supabase.rpc('increment_recipe_saved_count_rpc', { recipe_id_param: recipe_id });
    // if (updateCountError) console.error("Error updating saved_count:", updateCountError);


    return NextResponse.json({ message: 'Recipe saved successfully!' }, { status: 201 });

  } catch (error: any) {
    console.error('Error in /api/save-recipe:', error.message);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}

// Consider adding a DELETE method to this route for "unsaving" a recipe.
export async function DELETE(request: Request) {
  try {
    const { recipe_id } = await request.json();

    if (!recipe_id) {
      return NextResponse.json({ error: 'Recipe ID is required for unsaving.' }, { status: 400 });
    }

    let user_id = null;
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Error getting session or no session for DELETE:', sessionError?.message);
      return NextResponse.json({ error: 'User not authenticated or session expired.' }, { status: 401 });
    }
    user_id = session.user.id;

    if (!user_id) {
      return NextResponse.json({ error: 'User not authenticated.' }, { status: 401 });
    }

    const { error: deleteError } = await supabase
      .from('user_saved_recipes')
      .delete()
      .eq('user_id', user_id)
      .eq('recipe_id', recipe_id);

    if (deleteError) {
      console.error('Error unsaving recipe for user:', deleteError.message);
      return NextResponse.json({ error: 'Failed to unsave recipe.', details: deleteError.message }, { status: 500 });
    }

    // Optionally, decrement saved_count on recipes table.
    // const { error: updateCountError } = await supabase.rpc('decrement_recipe_saved_count_rpc', { recipe_id_param: recipe_id });
    // if (updateCountError) console.error("Error updating saved_count on unsave:", updateCountError);

    return NextResponse.json({ message: 'Recipe unsaved successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in DELETE /api/save-recipe:', error.message);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred while unsaving.' }, { status: 500 });
  }
}
// And potentially decrement the saved_count.
