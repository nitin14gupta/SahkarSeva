import { useState } from 'react'
import { View, Text, StyleSheet, Keyboard } from 'react-native'
import { router } from 'expo-router'
import { AppHeader, PhoneInput, PrimaryButton, KeyboardAvoidingWrapper, LogoMark } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { Colors, FontFamily, Spacing } from '@/constants'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function PhoneScreen() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { handleSendOTP } = useAuth()
  const insets = useSafeAreaInsets()
  const isValid = phone.length === 10

  const handleContinue = async () => {
    if (!isValid) return
    Keyboard.dismiss()
    setLoading(true)
    setError('')
    try {
      await handleSendOTP(phone)
      router.push({ pathname: '/otp', params: { phone } })
    } catch (e: any) {
      setError(e?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader showBack rightAction={<LogoMark size={20} opacity={0.7} />} />
      <KeyboardAvoidingWrapper transparent>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title}>What&apos;s your number?</Text>
            <Text style={styles.subtitle}>We&apos;ll send a one-time code</Text>
          </View>
          <PhoneInput
            value={phone}
            onChangeText={setPhone}
            error={error}
            autoFocus
          />
        </View>
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <PrimaryButton
            label="Send Code"
            onPress={handleContinue}
            disabled={!isValid}
            loading={loading}
          />
          <Text style={styles.legal}>
            By continuing, you agree to SahkarSeva&apos;s Terms and Privacy Policy.
          </Text>
        </View>
      </KeyboardAvoidingWrapper>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 20,
  },
  header: {
    marginBottom: 34,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
  },
  legal: {
    textAlign: 'center',
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 14,
    lineHeight: 16,
  },
})
