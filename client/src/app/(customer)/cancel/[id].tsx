import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BackButton, PrimaryButton, SecondaryButton } from '@/components/ui'
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
      show('Booking cancelled', 'default')
      router.back()
      router.back()
    } catch {
      show('Could not cancel booking. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.topRow}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Cancel booking</Text>
      </View>

      <View style={s.content}>
        <Text style={s.subtitle}>Why are you cancelling?</Text>
        {REASONS.map((r) => (
          <Pressable key={r} style={[s.option, reason === r && s.optionSelected]} onPress={() => setReason(r)}>
            <Text style={s.optionText}>{r}</Text>
            <View style={[s.radio, reason === r && s.radioSelected]} />
          </Pressable>
        ))}

        <Text style={s.policy}>
          Cancellations made less than 1 hour before the scheduled time may still incur a partial charge.
        </Text>
      </View>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label="Confirm Cancellation" onPress={handleConfirm} disabled={!reason} loading={submitting} />
        <View style={{ height: Spacing.sm }} />
        <SecondaryButton label="Never mind" onPress={() => router.back()} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
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
