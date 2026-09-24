import { useEffect, useState } from 'react'
import { ActivityIndicator, Share, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { CheckCircle2 } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PrimaryButton, SecondaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { APP_NAME, Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { BookingDetail } from '@/types/booking'
import type { Payment } from '@/types/payment'

export default function PaymentSuccessScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
  const insets = useSafeAreaInsets()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const [{ booking }, { payment }] = await Promise.all([
          apiService.getBookingDetail(bookingId),
          apiService.getPaymentForBooking(bookingId),
        ])
        if (cancelled) return
        setBooking(booking)
        setPayment(payment)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [bookingId])

  async function handleShare() {
    if (!booking || !payment) return
    await Share.share({
      message:
        `${APP_NAME} — Invoice\n\n` +
        `Service: ${booking.category}\n` +
        `Worker: ${booking.worker_name}\n` +
        `Date: ${booking.scheduled_date} ${booking.scheduled_time?.slice(0, 5) ?? ''}\n` +
        `Amount paid: ₹${payment.amount}\n` +
        `Payment ID: ${payment.razorpay_payment_id ?? '—'}`,
    })
  }

  function handleContinue() {
    router.push({ pathname: '/review/[bookingId]', params: { bookingId } })
  }

  if (loading || !booking || !payment) {
    return <View style={[s.container, s.center]}><ActivityIndicator color={Colors.brandGreen} /></View>
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.content}>
        <View style={s.successIcon}>
          <CheckCircle2 size={56} color={Colors.success} strokeWidth={1.5} />
        </View>
        <Text style={s.title}>Payment successful</Text>
        <Text style={s.subtitle}>₹{payment.amount} paid to {booking.worker_name}</Text>

        <View style={s.invoiceCard}>
          <Text style={s.invoiceTitle}>Invoice</Text>
          <InvoiceRow label="Service" value={booking.category} />
          <InvoiceRow label="Worker" value={booking.worker_name} />
          <InvoiceRow label="Date" value={`${booking.scheduled_date} ${booking.scheduled_time?.slice(0, 5) ?? ''}`} />
          <InvoiceRow label="Payment method" value={payment.method.toUpperCase()} />
          <InvoiceRow label="Payment ID" value={payment.razorpay_payment_id ?? '—'} />
          <View style={s.invoiceDivider} />
          <InvoiceRow label="Total" value={`₹${payment.amount}`} bold />
        </View>

        <SecondaryButton label="Share Invoice" onPress={handleShare} />
      </View>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label="Rate this service" onPress={handleContinue} />
      </View>
    </View>
  )
}

function InvoiceRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={s.invoiceRow}>
      <Text style={s.invoiceLabel}>{label}</Text>
      <Text style={[s.invoiceValue, bold && s.invoiceValueBold]}>{value}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
  },
  successIcon: {
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  invoiceCard: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: Spacing.lg,
  },
  invoiceTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  invoiceLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  invoiceValue: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  invoiceValueBold: {
    fontFamily: FontFamily.headingBold,
    fontSize: 15,
    color: Colors.terracotta,
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
})
