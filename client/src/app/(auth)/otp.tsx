import { useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Pencil } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppHeader, OTPInput, PrimaryButton, KeyboardAvoidingWrapper, LogoMark } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useCountdown } from '@/hooks/useCountdown'
import { resolveWorkerRoute } from '@/utils/workerRouting'
import { Colors, FontFamily, Spacing } from '@/constants'

export default function OTPScreen() {
  const { t } = useTranslation('auth')
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const insets = useSafeAreaInsets()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [attempts, setAttempts] = useState(0)
  const tooManyAttempts = attempts >= 3
  const { handleVerifyOTP, handleSendOTP } = useAuth()
  const { seconds, isExpired, reset } = useCountdown(45)

  const isComplete = code.length === 6

  const handleVerify = async (codeToVerify: string) => {
    if (codeToVerify.length !== 6 || tooManyAttempts) return
    setLoading(true)
    setError(false)
    setErrorMsg('')
    try {
      const user = await handleVerifyOTP(phone, codeToVerify)
      if (user.role === 'customer') {
        router.replace('/(customer)/(tabs)/home')
      } else if (user.role === 'worker') {
        router.replace(await resolveWorkerRoute())
      } else {
        // No role/profile yet — this is a first-time registration, not a login.
        router.push('/role')
      }
    } catch (e: any) {
      const next = attempts + 1
      setAttempts(next)
      setError(true)
      setErrorMsg(next >= 3 ? t('otp.tooManyAttempts') : (e?.message || t('otp.incorrectCode')))
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeCode = (next: string) => {
    setCode(next)
    if (next.length === 6 && !loading && !tooManyAttempts) handleVerify(next)
  }

  const handleResend = async () => {
    try {
      await handleSendOTP(phone)
      reset()
      setAttempts(0)
      setError(false)
      setErrorMsg('')
    } catch (e: any) {
      setError(true)
      setErrorMsg(e?.message || t('otp.resendFailed'))
    }
  }

  return (
    <View style={styles.screen}>
      <AppHeader
        showBack
        rightAction={<LogoMark size={20} opacity={0.7} />}
      />
      <KeyboardAvoidingWrapper transparent>
        <View style={styles.inner}>
          <Text style={styles.title}>{t('otp.title')}</Text>
          <View style={styles.sentRow}>
            <Text style={styles.sentText}>{t('otp.sentTo', { phone })}</Text>
            <Pressable onPress={() => router.back()}>
              <Pencil size={14} color={Colors.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>

          <OTPInput
            value={code}
            onChange={handleChangeCode}
            error={error}
            autoFocus
          />

          {errorMsg ? (
            <Text style={styles.errorMsg}>{errorMsg}</Text>
          ) : null}

          <View style={styles.resendArea}>
            {!isExpired && !tooManyAttempts ? (
              <Text style={styles.countdown}>
                {t('otp.resendIn')}{' '}
                <Text style={styles.countdownTimer}>
                  0:{String(seconds).padStart(2, '0')}
                </Text>
              </Text>
            ) : (
              <Pressable onPress={handleResend}>
                <Text style={styles.resendBtn}>{t('otp.resendCode')}</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <PrimaryButton
            label={t('common:continue')}
            onPress={() => handleVerify(code)}
            disabled={!isComplete || tooManyAttempts}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingWrapper>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 20,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 38,
  },
  sentText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorMsg: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.destructive,
    marginTop: 12,
  },
  resendArea: {
    marginTop: 28,
    alignItems: 'center',
  },
  countdown: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  countdownTimer: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.textPrimary,
  },
  resendBtn: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.brandGreen,
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
  },
})
