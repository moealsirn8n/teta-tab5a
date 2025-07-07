'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithPassword } from '@/lib/auth'; // Assuming this path is correct

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password, ya habibi/habibti.");
      setIsLoading(false);
      return;
    }

    const { error: signInError } = await signInWithPassword({ email, password });

    setIsLoading(false);

    if (signInError) {
      setError(signInError.message || "Teta says your login details are wrong. Try again!");
    } else {
      // On successful login, Supabase client handles session.
      // Redirect to home page or dashboard.
      router.push('/');
      // You might want to refresh user state globally here if using a context/store
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-flour p-4">
      <div className="w-full max-w-md p-8 bg-brand-white rounded-xl shadow-2xl border border-brand-clay/50">
        <h1 className="text-4xl font-bold text-brand-clay font-amiri text-center mb-2">
          Welcome Back, Habibi/Habibti!
        </h1>
        <p className="text-brand-spice font-comicNeue text-center mb-8">
          Teta missed you. Login to see your saved wisdom.
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-clay font-comicNeue">
              Email Address (like the one your cousin uses for Facebook)
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
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-clay font-comicNeue">
              Password (stronger than your uncle's arguments)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-brand-spice rounded-md shadow-sm focus:outline-none focus:ring-brand-clay focus:border-brand-clay sm:text-sm font-comicNeue"
              placeholder="****************"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md font-comicNeue text-center">
              {error}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-brand-white bg-brand-spice hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-clay font-comicNeue disabled:opacity-60"
            >
              {isLoading ? 'Checking with Teta...' : 'Login (Yalla!)'}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-brand-clay font-comicNeue">
          Don't have an account, ya weldi/binti?{' '}
          <Link href="/signup" className="font-medium text-brand-spice hover:text-brand-clay hover:underline">
            Sign up and make Teta proud!
          </Link>
        </p>
      </div>
       <Link href="/" className="mt-8 text-sm text-brand-spice hover:underline font-comicNeue">
        ← Back to Teta's Kitchen
      </Link>
    </div>
  );
}
