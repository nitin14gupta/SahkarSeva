import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { Smartphone, Wallet } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { AppHeader, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { PaymentMethodType } from '@/types/payment'

export default function PaymentMethodSelectScreen() {
  const { t } = useTranslation('customer')
  const METHODS: { type: PaymentMethodType; label: string; icon: typeof Smartphone }[] = [
    { type: 'upi', label: t('paymentSelect.methodUpi'), icon: Smartphone },
    { type: 'wallet', label: t('paymentSelect.methodWallet'), icon: Wallet },
  ]
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
  const insets = useSafeAreaInsets()
  const show = usePillStore((s) => s.show)
  const [selected, setSelected] = useState<PaymentMethodType>('upi')
  const [loading, setLoading] = useState(false)

  async function handlePay() {
    setLoading(true)
    try {
      const { payment } = await apiService.createPayment(bookingId, selected)
      if (!payment.checkout_url) throw new Error('No checkout URL returned')

      const result = await WebBrowser.openAuthSessionAsync(payment.checkout_url, 'client://payment-callback')

      if (result.type !== 'success' || !result.url) {
        show(t('paymentSelect.notCompleted'), 'default')
        return
      }

      const { queryParams } = Linking.parse(result.url)
      const paymentId = queryParams?.razorpay_payment_id as string | undefined
      const linkId = queryParams?.razorpay_payment_link_id as string | undefined
      const linkRef = queryParams?.razorpay_payment_link_reference_id as string | undefined
      const linkStatus = queryParams?.razorpay_payment_link_status as string | undefined
      const signature = queryParams?.razorpay_signature as string | undefined

      if (!paymentId || !linkId || !linkRef || !linkStatus || !signature) {
        show(t('paymentSelect.verifyError'), 'error')
        return
      }

      await apiService.verifyPayment({
        razorpay_payment_link_id: linkId,
        razorpay_payment_link_reference_id: linkRef,
        razorpay_payment_link_status: linkStatus,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      })

      router.replace({ pathname: '/payment/[bookingId]/success', params: { bookingId } })
    } catch {
      show(t('paymentSelect.payError'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={s.container}>
      <AppHeader title={t('paymentSelect.title')} showBack />

      <View style={s.content}>
        {METHODS.map(({ type, label, icon: Icon }) => (
          <Pressable
            key={type}
            style={[s.option, selected === type && s.optionSelected]}
            onPress={() => setSelected(type)}
          >
            <Icon size={20} color={selected === type ? Colors.brandGreen : Colors.textSecondary} strokeWidth={2} />
            <Text style={s.optionLabel}>{label}</Text>
            <View style={[s.radio, selected === type && s.radioSelected]} />
          </Pressable>
        ))}
      </View>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label={t('paymentSelect.payButton')} onPress={handlePay} loading={loading} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  optionSelected: {
    borderColor: Colors.brandGreen,
    backgroundColor: 'rgba(31,77,58,0.05)',
  },
  optionLabel: {
    flex: 1,
    fontFamily: FontFamily.bodySemiBold,
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
    borderColor: Colors.brandGreen,
    backgroundColor: Colors.brandGreen,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
})
