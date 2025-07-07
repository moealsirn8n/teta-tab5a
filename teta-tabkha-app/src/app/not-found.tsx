import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-brand-flour p-6">
      <style jsx global>{`
        /* Access CSS variables from globals.css for ramadan theme if active */
        body {
          background-color: var(--background, #F5DEB3); /* Default to brand-flour */
          color: var(--foreground, #A52A2A); /* Default to brand-spice */
        }
        .ramadan-theme body {
          background-color: var(--background); /* Will pick up Ramadan vars */
          color: var(--foreground);
        }
        .ramadan-theme .nf-text-brand-clay { color: var(--brand-clay-ramadan, #d1c4e9); }
        .ramadan-theme .nf-text-brand-spice { color: var(--brand-spice-ramadan, #fdd835); }
        .ramadan-theme .nf-bg-brand-spice { background-color: var(--brand-spice-ramadan, #fdd835); }
        .ramadan-theme .nf-text-brand-white { color: var(--background, #281E46); /* Text on spice button */ }

        /* Regular theme overrides for this page if needed, or use Tailwind */
         .nf-text-brand-clay { color: #8B4513; }
         .nf-text-brand-spice { color: #A52A2A; }
         .nf-bg-brand-spice { background-color: #A52A2A; }
         .nf-text-brand-white { color: #FFFFFF; }

      `}</style>

      {/* Teta's 404 Face - Placeholder */}
      {/* You could add a cartoon Teta image here */}
      <div className="mb-8">
        <span className="text-8xl" role="img" aria-label="Confused Face">🤔</span>
      </div>

      <h1 className="text-5xl font-bold font-amiri nf-text-brand-clay mb-4">
        Ya Weldi! Where Are You Going?
      </h1>
      <p className="text-2xl font-comicNeue nf-text-brand-spice mb-8">
        "Habibi, this page is missing... like your attempts at making kisra the first time! Don't worry, even Teta gets lost sometimes."
      </p>
      <Link href="/"
        className="px-8 py-3 nf-bg-brand-spice nf-text-brand-white font-comicNeue rounded-lg text-lg font-semibold hover:bg-opacity-80 transition-colors"
      >
        Back to Teta's Kitchen (Yalla!)
      </Link>

      <p className="mt-12 font-comicNeue nf-text-brand-clay text-sm">
        (Maybe try searching, or just ask Teta for a recipe. She always knows the way to good food.)
      </p>
    </div>
  );
}
