import { useState } from 'react'
import { View, Text, StyleSheet, Keyboard } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { AppHeader, PhoneInput, PrimaryButton, KeyboardAvoidingWrapper, LogoMark } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { Colors, FontFamily, Spacing } from '@/constants'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function PhoneScreen() {
  const { t } = useTranslation('auth')
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
      setError(e?.message || t('phone.errorGeneric'))
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
            <Text style={styles.title}>{t('phone.title')}</Text>
            <Text style={styles.subtitle}>{t('phone.subtitle')}</Text>
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
            label={t('phone.sendCode')}
            onPress={handleContinue}
            disabled={!isValid}
            loading={loading}
          />
          <Text style={styles.legal}>
            {t('phone.legal')}
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
