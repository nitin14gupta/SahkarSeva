import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { AppHeader, Input, KeyboardAvoidingWrapper, LanguageChip, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { useWorkerRegistrationDraftStore } from '@/store/workerRegistrationDraftStore'
import { Colors, FontFamily, Spacing } from '@/constants'
import type { Category } from '@/types/catalog'
import type { Cooperative } from '@/types/worker'

export default function WorkerRegisterCooperativeSkillsScreen() {
  const { t } = useTranslation('worker')
  const insets = useSafeAreaInsets()
  const draft = useWorkerRegistrationDraftStore()

  const [cooperatives, setCooperatives] = useState<Cooperative[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [cooperativeId, setCooperativeId] = useState(draft.cooperativeId)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(draft.categories)
  const [yearsExperience, setYearsExperience] = useState(
    draft.yearsExperience > 0 ? String(draft.yearsExperience) : ''
  )
  const [priceMin, setPriceMin] = useState(draft.priceMin != null ? String(draft.priceMin) : '')
  const [priceMax, setPriceMax] = useState(draft.priceMax != null ? String(draft.priceMax) : '')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [{ cooperatives }, { categories }] = await Promise.all([
          apiService.getCooperatives(),
          apiService.getCategories(),
        ])
        if (cancelled) return
        setCooperatives(cooperatives)
        setCategories(categories)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  function toggleCategory(name: string) {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    )
  }

  const isValid = !!cooperativeId && selectedCategories.length > 0 && !!yearsExperience && !!priceMin

  function handleContinue() {
    draft.setDraft({
      cooperativeId,
      categories: selectedCategories,
      yearsExperience: Number(yearsExperience) || 0,
      priceMin: priceMin ? Number(priceMin) : null,
      priceMax: priceMax ? Number(priceMax) : null,
    })
    router.push('/register/documents')
  }

  if (loading) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator color={Colors.brandGreen} />
      </View>
    )
  }

  return (
    <View style={s.container}>
      <AppHeader title={t('registerCooperativeSkills.title')} showBack />
      <KeyboardAvoidingWrapper transparent>
        <ScrollView style={s.inner} contentContainerStyle={s.innerContent}>
          <Text style={s.stepLabel}>{t('registerCooperativeSkills.stepLabel')}</Text>
          <Text style={s.title}>{t('registerCooperativeSkills.heading')}</Text>

          <Text style={s.fieldLabel}>{t('registerCooperativeSkills.cooperativeLabel')}</Text>
          <View style={s.chipRow}>
            {cooperatives.map((c) => (
              <LanguageChip
                key={c.id}
                label={c.name}
                selected={cooperativeId === c.id}
                onPress={() => setCooperativeId(c.id)}
              />
            ))}
          </View>

          <Text style={[s.fieldLabel, s.sectionGap]}>{t('registerCooperativeSkills.servicesLabel')}</Text>
          <View style={s.chipRow}>
            {categories.map((c) => (
              <LanguageChip
                key={c.id}
                label={c.name}
                selected={selectedCategories.includes(c.name)}
                onPress={() => toggleCategory(c.name)}
              />
            ))}
          </View>

          <Text style={[s.fieldLabel, s.sectionGap]}>{t('registerCooperativeSkills.experienceLabel')}</Text>
          <Input
            value={yearsExperience}
            onChangeText={setYearsExperience}
            placeholder={t('registerCooperativeSkills.experiencePlaceholder')}
            keyboardType="number-pad"
          />

          <Text style={[s.fieldLabel, s.sectionGap]}>{t('registerCooperativeSkills.priceRangeLabel')}</Text>
          <View style={s.priceRow}>
            <Input
              value={priceMin}
              onChangeText={setPriceMin}
              placeholder={t('registerCooperativeSkills.priceMinPlaceholder')}
              keyboardType="number-pad"
              style={s.priceInput}
            />
            <Input
              value={priceMax}
              onChangeText={setPriceMax}
              placeholder={t('registerCooperativeSkills.priceMaxPlaceholder')}
              keyboardType="number-pad"
              style={s.priceInput}
            />
          </View>
        </ScrollView>

        <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <PrimaryButton label={t('common:continue')} onPress={handleContinue} disabled={!isValid} />
        </View>
      </KeyboardAvoidingWrapper>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  inner: { flex: 1, paddingHorizontal: Spacing.screenPadding },
  innerContent: { paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  stepLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.brandGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  sectionGap: { marginTop: Spacing.lg },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  priceInput: { flex: 1 },
  footer: { paddingHorizontal: Spacing.screenPadding },
})
