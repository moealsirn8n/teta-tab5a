import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-clay': '#8B4513', // for clay pots
        'brand-flour': '#F5DEB3', // for flour
        'brand-spice': '#A52A2A', // for spices
        // Sudanese flag colors (use as needed for accents)
        'brand-green': '#008000',
        'brand-red': '#FF0000',
        'brand-black': '#000000',
        'brand-white': '#FFFFFF',
      },
      fontFamily: {
        amiri: ['Amiri', 'serif'],
        comicNeue: ['"Comic Neue"', 'cursive'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
