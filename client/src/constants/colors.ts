// SahkarSeva 60/30/10 color system — see SahkarSeva_App_Screens_and_ColorSystem.md
export const Colors = {
  // 60% dominant — canvas
  background: '#FAF8F5',
  surface: '#FFFFFF',

  // 30% secondary / brand
  brandGreen: '#1F4D3A',

  // 10% accent
  terracotta: '#C05B41',
  gold: '#D4A017',

  // Semantic (kept distinct from brand colors so meaning never collides)
  success: '#1F4D3A',
  destructive: '#D64545',
  warning: '#D4A017',

  // Text
  textPrimary: '#1E1A16',
  textSecondary: '#6E6459',
  inkOnAccent: '#FFFFFF',
  inkDisabled: '#B8AFA4',

  // Structure
  divider: '#E7E1D8',
  white: '#FFFFFF',
} as const

// Dark mode — accents unchanged, only surfaces/text invert
export const DarkColors = {
  background: '#12201A',
  surface: '#1B2E24',
  brandGreen: '#1F4D3A',
  terracotta: '#C05B41',
  gold: '#D4A017',
  success: '#1F4D3A',
  destructive: '#D64545',
  warning: '#D4A017',
  textPrimary: '#F2EDE6',
  textSecondary: '#A69C90',
  inkOnAccent: '#FFFFFF',
  inkDisabled: '#5C554C',
  divider: '#2A3B32',
  white: '#FFFFFF',
} as const

export type Color = (typeof Colors)[keyof typeof Colors]

export function withOpacity(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
