/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vibe-purple': '#8B5CF6',
        'vibe-blue': '#3B82F6',
        'vibe-pink': '#EC4899',
        'vibe-green': '#10B981',
        'vibe-orange': '#F59E0B',
      },
      backgroundImage: {
        'gradient-vibe': 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}
