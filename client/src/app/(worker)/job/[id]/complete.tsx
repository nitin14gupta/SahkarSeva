import { useCallback, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppHeader, Input, InvoicePreview, KeyboardAvoidingWrapper, OTPInput, PrimaryButton, SecondaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { useCountdown } from '@/hooks/useCountdown'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Spacing } from '@/constants'
import type { WorkerBookingDetail } from '@/types/booking'

export default function JobCompleteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const show = usePillStore((s) => s.show)

  const [booking, setBooking] = useState<WorkerBookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { seconds, isExpired, reset } = useCountdown(45)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        setLoading(true)
        try {
          const { booking } = await apiService.getWorkerBookingDetail(id)
          if (!cancelled) {
            setBooking(booking)
            setAmount(booking.price_estimate != null ? String(booking.price_estimate) : '')
          }
        } catch {
          if (!cancelled) show('Could not load this job', 'error')
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => { cancelled = true }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when the route id changes, `show` is a stable zustand setter
    }, [id])
  )

  async function handleSendOtp() {
    setSendingOtp(true)
    try {
      await apiService.sendCompletionOtp(id)
      setOtpSent(true)
      reset()
    } catch {
      show('Could not send confirmation code', 'error')
    } finally {
      setSendingOtp(false)
    }
  }

  async function handleSubmit() {
    if (code.length !== 6 || !amount) return
    setSubmitting(true)
    try {
      await apiService.completeBooking(id, { otp_code: code, final_amount: Number(amount) })
      show('Job completed!', 'success')
      router.replace('/(worker)/(tabs)/home')
    } catch {
      show('Incorrect code. Ask the customer to check and try again.', 'error')
      setCode('')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !booking) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator color={Colors.brandGreen} />
      </View>
    )
  }

  return (
    <View style={s.container}>
      <AppHeader title="Complete job" showBack />
      <KeyboardAvoidingWrapper transparent>
        <View style={s.inner}>
          <Text style={s.fieldLabel}>Final amount (₹)</Text>
          <Input value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="0" style={s.gapBelow} />

          <InvoicePreview
            category={booking.category}
            customerName={booking.customer_name}
            date={booking.scheduled_date}
            amount={Number(amount) || 0}
          />

          {!otpSent ? (
            <View style={s.confirmSection}>
              <Text style={s.confirmHint}>
                We&apos;ll send a confirmation code to {booking.customer_name} to verify the job is done.
              </Text>
              <SecondaryButton label="Send code to customer" onPress={handleSendOtp} loading={sendingOtp} disabled={!amount} />
            </View>
          ) : (
            <View style={s.confirmSection}>
              <Text style={s.fieldLabel}>Ask the customer for their code</Text>
              <OTPInput value={code} onChange={setCode} autoFocus />
              {!isExpired ? (
                <Text style={s.countdown}>Code expires in 0:{String(seconds).padStart(2, '0')}</Text>
              ) : (
                <SecondaryButton label="Resend code" onPress={handleSendOtp} loading={sendingOtp} />
              )}
            </View>
          )}
        </View>

        <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <PrimaryButton
            label="Submit"
            onPress={handleSubmit}
            disabled={!otpSent || code.length !== 6}
            loading={submitting}
          />
        </View>
      </KeyboardAvoidingWrapper>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  inner: { flex: 1, paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md },
  fieldLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  gapBelow: { marginBottom: Spacing.lg },
  confirmSection: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  confirmHint: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  countdown: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: { paddingHorizontal: Spacing.screenPadding },
})
