/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'bg-primary': '#0A0F1E',
        'bg-surface': '#0F172A',
        'bg-card': '#1E293B',
        'border': '#334155',
        'blue': '#2563EB',
        'cyan': '#06B6D4',
        'green': '#10B981',
        'amber': '#F59E0B',
        'red': '#EF4444',
        'purple': '#8B5CF6',
        'text': '#F1F5F9',
        'muted': '#64748B',
      },
    },
  },
  plugins: [],
}
