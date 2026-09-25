import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'

const REASONS = [
  'Booked by mistake',
  'Found another worker',
  'Schedule changed',
  'Price too high',
  'Other',
]

export default function CancelBookingScreen() {
  const { t } = useTranslation('customer')
  const reasonDisplay: Record<string, string> = {
    'Booked by mistake': t('cancelBooking.reasonMistake'),
    'Found another worker': t('cancelBooking.reasonFoundAnother'),
    'Schedule changed': t('cancelBooking.reasonScheduleChanged'),
    'Price too high': t('cancelBooking.reasonPriceTooHigh'),
    Other: t('cancelBooking.reasonOther'),
  }
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const show = usePillStore((s) => s.show)
  const [reason, setReason] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirm() {
    if (!reason) return
    setSubmitting(true)
    try {
      await apiService.cancelBooking(id, reason)
      show(t('cancelBooking.successMessage'), 'default')
      router.back()
      router.back()
    } catch {
      show(t('cancelBooking.error'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={s.container}>
      <AppHeader title={t('cancelBooking.title')} showBack />

      <View style={s.content}>
        <Text style={s.subtitle}>{t('cancelBooking.subtitle')}</Text>
        {REASONS.map((r) => (
          <Pressable key={r} style={[s.option, reason === r && s.optionSelected]} onPress={() => setReason(r)}>
            <Text style={s.optionText}>{reasonDisplay[r]}</Text>
            <View style={[s.radio, reason === r && s.radioSelected]} />
          </Pressable>
        ))}

        <Text style={s.policy}>
          {t('cancelBooking.policy')}
        </Text>
      </View>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label={t('cancelBooking.confirmButton')} onPress={handleConfirm} disabled={!reason} loading={submitting} />
        <View style={{ height: Spacing.sm }} />
        <SecondaryButton label={t('cancelBooking.neverMind')} onPress={() => router.back()} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
  },
  subtitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  optionSelected: {
    borderColor: Colors.destructive,
  },
  optionText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.divider,
  },
  radioSelected: {
    borderColor: Colors.destructive,
    backgroundColor: Colors.destructive,
  },
  policy: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
})
