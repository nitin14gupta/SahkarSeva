import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { CreditCard, Smartphone, Wallet } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BackButton, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { PaymentMethodType } from '@/types/payment'

const METHODS: { type: PaymentMethodType; label: string; icon: typeof Smartphone }[] = [
  { type: 'upi', label: 'UPI', icon: Smartphone },
  { type: 'card', label: 'Card', icon: CreditCard },
  { type: 'wallet', label: 'Wallet', icon: Wallet },
]

export default function PaymentMethodSelectScreen() {
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
        show('Payment was not completed', 'default')
        return
      }

      const { queryParams } = Linking.parse(result.url)
      const paymentId = queryParams?.razorpay_payment_id as string | undefined
      const linkId = queryParams?.razorpay_payment_link_id as string | undefined
      const linkRef = queryParams?.razorpay_payment_link_reference_id as string | undefined
      const linkStatus = queryParams?.razorpay_payment_link_status as string | undefined
      const signature = queryParams?.razorpay_signature as string | undefined

      if (!paymentId || !linkId || !linkRef || !linkStatus || !signature) {
        show('Payment could not be verified', 'error')
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
      show('Payment failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.topRow}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Payment method</Text>
      </View>

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
        <PrimaryButton label="Pay Now" onPress={handlePay} loading={loading} />
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
