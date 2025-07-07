'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUpNewUser } from '@/lib/auth'; // Assuming this path is correct

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields, habibi/habibti. Teta is watching!");
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match. Are you trying to confuse Teta?");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
        setError("Password should be at least 6 characters, ya3ni strong like Sudanese coffee!");
        setIsLoading(false);
        return;
    }

    const { data, error: signUpError } = await signUpNewUser({ email, password });

    setIsLoading(false);

    if (signUpError) {
      setError(signUpError.message || "Teta says something went wrong with signup. Try again!");
    } else {
      // Depending on Supabase email confirmation settings:
      // data.user might exist, data.session might be null until confirmation.
      if (data.session) {
        // If session is returned, user is likely auto-confirmed or logged in.
        router.push('/');
      } else if (data.user && !data.session) {
        // User created, but confirmation email sent.
        setMessage("Teta is happy! Check your email to confirm your account, ya shatir/shatira.");
      } else {
        // Fallback, should ideally not happen if user or error is present
         setMessage("Account created! You might need to confirm your email.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-flour p-4">
      <div className="w-full max-w-md p-8 bg-brand-white rounded-xl shadow-2xl border border-brand-clay/50">
        <h1 className="text-4xl font-bold text-brand-clay font-amiri text-center mb-2">
          Join Teta's Kitchen!
        </h1>
        <p className="text-brand-spice font-comicNeue text-center mb-8">
          New here? Sign up so Teta can save your favorite recipes (and scoldings).
        </p>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-clay font-comicNeue">
              Email Address (Teta needs this for her records)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-brand-spice rounded-md shadow-sm focus:outline-none focus:ring-brand-clay focus:border-brand-clay sm:text-sm font-comicNeue"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-clay font-comicNeue">
              Password (make it good, like Teta's asida)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-brand-spice rounded-md shadow-sm focus:outline-none focus:ring-brand-clay focus:border-brand-clay sm:text-sm font-comicNeue"
            />
          </div>
           <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-clay font-comicNeue">
              Confirm Password (again, just to be sure, Teta insists!)
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-brand-spice rounded-md shadow-sm focus:outline-none focus:ring-brand-clay focus:border-brand-clay sm:text-sm font-comicNeue"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md font-comicNeue text-center">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md font-comicNeue text-center">
              {message}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-brand-white bg-brand-spice hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-clay font-comicNeue disabled:opacity-60"
            >
              {isLoading ? 'Teta is preparing your seat...' : 'Sign Up (Join the Family!)'}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-brand-clay font-comicNeue">
          Already have an account, haboob?{' '}
          <Link href="/login" className="font-medium text-brand-spice hover:text-brand-clay hover:underline">
            Login here!
          </Link>
        </p>
      </div>
      <Link href="/" className="mt-8 text-sm text-brand-spice hover:underline font-comicNeue">
        ← No, take me back to the food!
      </Link>
    </div>
  );
}
