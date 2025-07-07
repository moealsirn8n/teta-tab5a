import Link from "next/link";

'use client'; // For useEffect and useState

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, signOut, onAuthStateChange } from "@/lib/auth"; // Assuming auth.ts is in lib
import type { User } from "@supabase/supabase-js";

const Header = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // To manage initial loading state
  const [isRamadanMode, setIsRamadanMode] = useState(false); // Ramadan Mode state
  const router = useRouter();

  useEffect(() => {
    // Persist Ramadan mode setting if desired (e.g., localStorage)
    const savedRamadanMode = localStorage.getItem('isRamadanMode');
    if (savedRamadanMode) {
      const newMode = JSON.parse(savedRamadanMode);
      setIsRamadanMode(newMode);
      document.documentElement.classList.toggle('ramadan-theme', newMode);
    }

    const fetchUser = async () => {
      setIsLoading(true);
      const { user } = await getCurrentUser();
      setCurrentUser(user);
      setIsLoading(false);
    };

    fetchUser();

    const { data: authListener } = onAuthStateChange((event, session) => {
      console.log("Auth event:", event);
      setCurrentUser(session?.user ?? null);
      if (event === "SIGNED_OUT") {
        // Optionally redirect or refresh parts of the app
        router.push('/'); // Redirect to home on logout
      }
      if (event === "SIGNED_IN" && window.location.pathname === '/login' || window.location.pathname === '/signup') {
        router.push('/'); // Redirect to home on login/signup if on those pages
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      alert(`Teta says: ${error.message}`); // Basic error handling
    } else {
      setCurrentUser(null); // Update local state
      // router.push('/'); // onAuthStateChange will handle this
    }
  };

  return (
    <header className="bg-brand-clay text-brand-white p-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <Link href="/" className="text-3xl font-bold font-amiri hover:text-brand-flour transition-colors">
          Teta Tab5a
        </Link>
        <nav className="font-comicNeue text-sm space-x-3 md:space-x-4 items-center flex">
          <Link href="/about" className="hover:text-brand-flour transition-colors">
            About Teta
          </Link>
          {currentUser && (
            <Link href="/saved-recipes" className="hover:text-brand-flour transition-colors">
              My Scrapbook
            </Link>
          )}

          {isLoading ? (
            <span className="text-xs opacity-70">Loading...</span>
          ) : currentUser ? (
            <>
              <span className="text-xs hidden md:inline">Salaam, {currentUser.email?.split('@')[0]}!</span>
              <button
                onClick={handleLogout}
                className="bg-brand-spice hover:bg-opacity-75 text-white px-3 py-1.5 rounded-md text-xs transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-brand-flour transition-colors">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-brand-spice hover:bg-opacity-75 text-white px-3 py-1.5 rounded-md text-xs transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
          {/* Ramadan Mode Toggle */}
          <div className="flex items-center ml-2 md:ml-4">
            <label htmlFor="ramadanToggle" className="mr-1.5 text-xs cursor-pointer hover:text-brand-flour" title="Toggle Ramadan Theme">
              🌙
            </label>
            <button
              id="ramadanToggle"
              onClick={() => {
                const newMode = !isRamadanMode;
                setIsRamadanMode(newMode);
                localStorage.setItem('isRamadanMode', JSON.stringify(newMode));
                document.documentElement.classList.toggle('ramadan-theme', newMode);
                // TODO: Propagate this state to affect AI prompts if desired
              }}
              className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-brand-clay focus:ring-yellow-400 ${isRamadanMode ? 'bg-yellow-500' : 'bg-gray-400'}`}
              title={isRamadanMode ? "Deactivate Ramadan Theme" : "Activate Ramadan Theme"}
            >
              <span
                className={`inline-block w-3.5 h-3.5 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isRamadanMode ? 'translate-x-4' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
          <Link href="/saved-recipes">Saved Recipes</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
