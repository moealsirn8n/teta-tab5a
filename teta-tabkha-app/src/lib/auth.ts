import { supabase } from './supabaseClient';
import type { SignUpWithPasswordCredentials, SignInWithPasswordCredentials } from '@supabase/supabase-js';

// Sign up a new user
export const signUpNewUser = async (credentials: SignUpWithPasswordCredentials) => {
  const { data, error } = await supabase.auth.signUp(credentials);
  if (error) {
    console.error('Error signing up:', error.message);
    // It's good practice to throw the error or return it so UI can react
    return { user: null, session: null, error };
  }
  // The data object for a signUp call includes user and session if successful.
  // For email signups, a confirmation email might be sent.
  // data.user will contain the user object.
  // data.session will be null if email confirmation is required and not yet done.
  // Or it might contain a session if auto-confirmation is enabled or for OAuth.
  return { user: data.user, session: data.session, error: null };
};

// Log in an existing user
export const signInWithPassword = async (credentials: SignInWithPasswordCredentials) => {
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  if (error) {
    console.error('Error signing in:', error.message);
    return { user: null, session: null, error };
  }
  // data.user contains the user object
  // data.session contains the session object
  return { user: data.user, session: data.session, error: null };
};

// Log out the current user
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
    return { error };
  }
  return { error: null };
};

// Get the current user session
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error.message);
    return { session: null, error };
  }
  return { session: data.session, error: null };
};

// Get the current user details
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
   if (error) {
    console.error('Error getting user:', error.message);
    return { user: null, error };
  }
  return { user, error: null };
};

// Listen to authentication state changes
// This is useful for updating UI in real-time when user logs in or out
export const onAuthStateChange = (callback: (event: string, session: import('@supabase/supabase-js').Session | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
};

// Example usage for onAuthStateChange:
//
// onAuthStateChange((event, session) => {
//   console.log(event, session);
//   if (event === 'SIGNED_IN') {
//     // handle user signed in
//   } else if (event === 'SIGNED_OUT') {
//     // handle user signed out
//   }
// });
