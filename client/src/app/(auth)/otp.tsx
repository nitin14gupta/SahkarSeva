import { useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Pencil } from 'lucide-react-native'
import { BackButton, OTPInput, PrimaryButton, Screen, KeyboardAvoidingWrapper, LogoMark } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useCountdown } from '@/hooks/useCountdown'
import { Colors, FontFamily, Spacing } from '@/constants'

export default function OTPScreen() {
  const { phone, role } = useLocalSearchParams<{ phone: string; role: string }>()
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
      await handleVerifyOTP(phone, codeToVerify)
      router.push({ pathname: '/(auth)/profile-setup', params: { role } })
    } catch (e: any) {
      const next = attempts + 1
      setAttempts(next)
      setError(true)
      setErrorMsg(next >= 3 ? 'Too many attempts — request a new code.' : (e?.message || 'Incorrect code. Try again.'))
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
      setErrorMsg(e?.message || 'Failed to resend code. Try again.')
    }
  }

  return (
    <Screen>
      <View style={styles.topRow}>
        <BackButton transparent onPress={() => router.back()} />
        <LogoMark size={20} opacity={0.7} style={styles.topLogo} />
      </View>
      <KeyboardAvoidingWrapper transparent>
        <View style={styles.inner}>
          <Text style={styles.title}>Enter the code</Text>
          <View style={styles.sentRow}>
            <Text style={styles.sentText}>Sent to +91 {phone}</Text>
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
                Resend code in{' '}
                <Text style={styles.countdownTimer}>
                  0:{String(seconds).padStart(2, '0')}
                </Text>
              </Text>
            ) : (
              <Pressable onPress={handleResend}>
                <Text style={styles.resendBtn}>Resend code</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label="Continue"
            onPress={() => handleVerify(code)}
            disabled={!isComplete || tooManyAttempts}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingWrapper>
    </Screen>
  )
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topLogo: {
    marginRight: Spacing.screenPadding,
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
    paddingBottom: 16,
  },
})
