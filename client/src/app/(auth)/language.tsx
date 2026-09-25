import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LanguageChip, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import i18n from '@/i18n'
import { useAuthStore } from '@/store/authStore'
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
  const { t } = useTranslation('auth')
  const { from } = useLocalSearchParams<{ from?: string }>()
  const insets = useSafeAreaInsets()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const [selected, setSelected] = useState(from === 'profile' ? (user?.language ?? 'en') : 'en')
  const [saving, setSaving] = useState(false)

  async function handleContinue() {
    await SecureStore.setItemAsync(CacheKeys.language, selected)
    await i18n.changeLanguage(selected)

    if (from === 'profile' && user) {
      setSaving(true)
      try {
        const { user: updated } = await apiService.completeProfile({
          name: user.name ?? '',
          role: user.role ?? 'customer',
          language: selected,
        })
        setUser(updated)
      } finally {
        setSaving(false)
      }
      router.back()
      return
    }

    router.push('/phone')
  }

  return (
    <View style={[s.container, { paddingTop: insets.top + Spacing.xl }]}>
      <View style={s.header}>
        <Text style={s.title}>{t('language.title')}</Text>
        <Text style={s.subtitle}>{t('language.subtitle')}</Text>
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
        <PrimaryButton label={t('common:continue')} onPress={handleContinue} loading={saving} />
        <Text style={s.poweredBy}>{t('language.poweredBy')}</Text>
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
