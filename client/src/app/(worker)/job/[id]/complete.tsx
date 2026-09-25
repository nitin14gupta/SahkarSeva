import { useCallback, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { AppHeader, Input, InvoicePreview, KeyboardAvoidingWrapper, OTPInput, PrimaryButton, SecondaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { useCountdown } from '@/hooks/useCountdown'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Spacing } from '@/constants'
import type { WorkerBookingDetail } from '@/types/booking'

export default function JobCompleteScreen() {
  const { t } = useTranslation('worker')
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
          if (!cancelled) show(t('jobComplete.loadError'), 'error')
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
      show(t('jobComplete.sendCodeError'), 'error')
    } finally {
      setSendingOtp(false)
    }
  }

  async function handleSubmit() {
    if (code.length !== 6 || !amount) return
    setSubmitting(true)
    try {
      await apiService.completeBooking(id, { otp_code: code, final_amount: Number(amount) })
      show(t('jobComplete.completedSuccess'), 'success')
      router.replace('/(worker)/(tabs)/home')
    } catch {
      show(t('jobComplete.incorrectCodeError'), 'error')
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
      <AppHeader title={t('jobComplete.title')} showBack />
      <KeyboardAvoidingWrapper transparent>
        <View style={s.inner}>
          <Text style={s.fieldLabel}>{t('jobComplete.finalAmountLabel')}</Text>
          <Input value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder={t('jobComplete.amountPlaceholder')} style={s.gapBelow} />

          <InvoicePreview
            category={booking.category}
            customerName={booking.customer_name}
            date={booking.scheduled_date}
            amount={Number(amount) || 0}
          />

          {!otpSent ? (
            <View style={s.confirmSection}>
              <Text style={s.confirmHint}>
                {t('jobComplete.confirmHint', { name: booking.customer_name })}
              </Text>
              <SecondaryButton label={t('jobComplete.sendCodeButton')} onPress={handleSendOtp} loading={sendingOtp} disabled={!amount} />
            </View>
          ) : (
            <View style={s.confirmSection}>
              <Text style={s.fieldLabel}>{t('jobComplete.askCodeLabel')}</Text>
              <OTPInput value={code} onChange={setCode} autoFocus />
              {!isExpired ? (
                <Text style={s.countdown}>{t('jobComplete.codeExpiresIn')} 0:{String(seconds).padStart(2, '0')}</Text>
              ) : (
                <SecondaryButton label={t('jobComplete.resendButton')} onPress={handleSendOtp} loading={sendingOtp} />
              )}
            </View>
          )}
        </View>

        <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <PrimaryButton
            label={t('jobComplete.submitButton')}
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
