import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LanguageChip, PrimaryButton } from '@/components/ui'
import { CacheKeys, Colors, FontFamily, Spacing } from '@/constants'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'bn', label: 'বাংলা' },
]

export default function LanguageScreen() {
  const insets = useSafeAreaInsets()
  const [selected, setSelected] = useState('en')

  async function handleContinue() {
    await SecureStore.setItemAsync(CacheKeys.language, selected)
    router.push('/role')
  }

  return (
    <View style={[s.container, { paddingTop: insets.top + Spacing.xl }]}>
      <View style={s.header}>
        <Text style={s.title}>Choose your language</Text>
        <Text style={s.subtitle}>You can change this later in Profile</Text>
      </View>

      <View style={s.grid}>
        {LANGUAGES.map((lang) => (
          <LanguageChip
            key={lang.code}
            label={lang.label}
            selected={selected === lang.code}
            onPress={() => setSelected(lang.code)}
          />
        ))}
      </View>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        <PrimaryButton label="Continue" onPress={handleContinue} />
        <Text style={s.poweredBy}>Powered by Bhashini · Made in India</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screenPadding,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 26,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  footer: {
    marginTop: 'auto',
  },
  poweredBy: {
    textAlign: 'center',
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
})
