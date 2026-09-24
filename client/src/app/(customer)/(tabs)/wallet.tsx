import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { CreditCard, Plus, Receipt, Smartphone, Wallet as WalletIcon } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { EmptyState, Screen } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { PaymentHistoryItem, PaymentMethod } from '@/types/payment'

const METHOD_ICON = { upi: Smartphone, card: CreditCard, wallet: WalletIcon }

export default function WalletScreen() {
  const insets = useSafeAreaInsets()
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const [{ methods }, { payments }] = await Promise.all([
          apiService.getPaymentMethods(),
          apiService.getPayments(),
        ])
        if (cancelled) return
        setMethods(methods)
        setPayments(payments)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return <Screen><View style={s.center}><ActivityIndicator color={Colors.brandGreen} /></View></Screen>
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <Text style={s.title}>Wallet</Text>

      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Payment methods</Text>
          <Pressable onPress={() => router.push('/payment-methods/add')}>
            <Plus size={18} color={Colors.brandGreen} strokeWidth={2} />
          </Pressable>
        </View>
        {methods.length === 0 ? (
          <Text style={s.mutedText}>No saved payment methods</Text>
        ) : (
          methods.map((m) => {
            const Icon = METHOD_ICON[m.type]
            return (
              <View key={m.id} style={s.methodCard}>
                <Icon size={18} color={Colors.brandGreen} strokeWidth={2} />
                <Text style={s.methodLabel}>
                  {m.type === 'upi' ? m.upi_id : m.type === 'card' ? `${m.card_brand ?? 'Card'} •••• ${m.card_last4}` : 'Wallet'}
                </Text>
                {m.is_default && <View style={s.defaultBadge}><Text style={s.defaultText}>Default</Text></View>}
              </View>
            )
          })
        )}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Transaction history</Text>
        {payments.length === 0 ? (
          <EmptyState icon={Receipt} title="No transactions yet" subtitle="Your payments will show up here" />
        ) : (
          payments.map((p) => (
            <View key={p.id} style={s.txnRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.txnTitle}>{p.category} · {p.worker_name}</Text>
                <Text style={s.txnDate}>{new Date(p.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={[s.txnAmount, p.status !== 'success' && s.txnAmountPending]}>
                {p.status === 'success' ? '' : p.status === 'failed' ? 'Failed · ' : 'Pending · '}₹{p.amount}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 22,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  section: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  mutedText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: Spacing.sm,
  },
  methodLabel: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  defaultBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(31,77,58,0.1)',
  },
  defaultText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 10,
    color: Colors.brandGreen,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  txnTitle: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  txnDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  txnAmount: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  txnAmountPending: {
    color: Colors.textSecondary,
  },
})
