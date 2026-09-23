import { Platform } from 'react-native'

// No custom font files loaded yet — these map to the system font stack so
// components/screens can already code against a stable FontFamily API.
// Swap these string values for real font family names once fonts are added
// (via expo-font) — nothing else in the app needs to change.
const systemFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' })!
const systemFontMedium = Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' })!

export const FontFamily = {
  headingBold: systemFont,
  bodyRegular: systemFont,
  bodyMedium: systemFontMedium,
  bodySemiBold: systemFontMedium,
} as const
