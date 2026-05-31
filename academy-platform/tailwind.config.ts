import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary':'#0A0F1C','bg-secondary':'#111827','bg-card':'#141d2e',
        'gold':'#C9A84C','gold-light':'#E2C06A',
        'text-primary':'#F0EBE1','text-secondary':'#9EA8B8','text-muted':'#5A6478',
        'border':'#1e2d47','border-light':'#2a3d5c','danger':'#A83232',
      },
      fontFamily: { heading:['Playfair Display','serif'], body:['Inter','sans-serif'], mono:['JetBrains Mono','monospace'] },
    },
  },
  plugins: [],
}
export default config
