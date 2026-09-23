/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#FAF8F5',
        surface: '#FFFFFF',
        brandGreen: '#1F4D3A',
        terracotta: '#C05B41',
        gold: '#D4A017',
        success: '#1F4D3A',
        destructive: '#D64545',
        warning: '#D4A017',
        textPrimary: '#1E1A16',
        textSecondary: '#6E6459',
        divider: '#E7E1D8',
        darkBackground: '#12201A',
        darkSurface: '#1B2E24',
        darkTextPrimary: '#F2EDE6',
      },
    },
  },
  plugins: [],
}
