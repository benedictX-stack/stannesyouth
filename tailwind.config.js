/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000', // obsidian
          50: '#161717', // night-sky
          100: '#161717',
          200: '#161717',
          300: '#161717',
          400: '#000000',
        },
        surface: {
          DEFAULT: '#161717',
          light: '#161717',
          lighter: '#4d4d4d', // shadow
        },
        cream: {
          DEFAULT: '#ffffff', // ghost
          dark: '#cccccc', // graphite
          muted: '#969696', // pebble-gray
        },
        ocean: {
          DEFAULT: '#808080', // steel-gray
          light: '#8a8f98', // cosmic-dust
          dark: '#4d4d4d',
          glow: 'rgba(128, 128, 128, 0.3)',
        },
        sunset: {
          DEFAULT: '#fe2c02', // ember-glow
          light: '#ff9aea', // subtle-violet-gradient
          dark: '#fe2c02',
          glow: 'rgba(254, 44, 2, 0.3)',
        },
        gold: {
          DEFAULT: '#FACC15', // vibrant-yellow
          light: '#FDE68A', // soft-yellow
          dark: '#EAB308', // deep-yellow
          glow: 'rgba(250, 204, 21, 0.25)',
        },
        teal: {
          DEFAULT: '#161717',
          light: '#4d4d4d',
          dark: '#000000',
        },
        muted: '#969696',
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Outfit', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        numbers: ['Space Grotesk', 'sans-serif'],
        quote: ['Playfair Display', 'serif'],
      },
      fontSize: {
        'display-xl': ['clamp(3rem, 8vw, 8rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display': ['clamp(2.5rem, 6vw, 6rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-sm': ['clamp(2rem, 4vw, 4rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'heading': ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'zoom-in': 'zoomIn 1.2s ease-out forwards',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scroll-indicator': 'scrollBounce 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scrollBounce: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '1' },
          '50%': { transform: 'translateY(12px)', opacity: '0.5' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
