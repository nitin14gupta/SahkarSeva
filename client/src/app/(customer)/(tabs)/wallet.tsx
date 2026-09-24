import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Plus, Receipt, Smartphone, Trash2, Wallet as WalletIcon } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { EmptyState, Screen } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { PaymentHistoryItem, PaymentMethod } from '@/types/payment'

const METHOD_ICON = { upi: Smartphone, wallet: WalletIcon }

export default function WalletScreen() {
  const insets = useSafeAreaInsets()
  const show = usePillStore((s) => s.show)
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        setLoading(true)
        try {
          const [{ methods }, { payments }] = await Promise.all([
            apiService.getPaymentMethods(),
            apiService.getPayments(),
          ])
          if (!cancelled) {
            setMethods(methods)
            setPayments(payments)
          }
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => { cancelled = true }
    }, [])
  )

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const [{ methods }, { payments }] = await Promise.all([
        apiService.getPaymentMethods(),
        apiService.getPayments(),
      ])
      setMethods(methods)
      setPayments(payments)
    } catch {
      // keep whatever was already showing — the pull gesture retrying silently is fine
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return <Screen><View style={s.center}><ActivityIndicator color={Colors.brandGreen} /></View></Screen>
  }

  async function handleSetDefault(id: string) {
    const previous = methods
    setMethods((prev) => prev.map((m) => ({ ...m, is_default: m.id === id })))
    try {
      await apiService.setDefaultPaymentMethod(id)
    } catch {
      setMethods(previous)
      show('Could not update default payment method', 'error')
    }
  }

  async function handleDeleteMethod(id: string) {
    const previous = methods
    setMethods((prev) => prev.filter((m) => m.id !== id))
    try {
      await apiService.deletePaymentMethod(id)
    } catch {
      setMethods(previous)
      show('Could not delete payment method', 'error')
    }
  }

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: Spacing.xl }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.brandGreen]} tintColor={Colors.brandGreen} />}
    >
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
                  {m.type === 'upi' ? m.upi_id : 'Wallet'}
                </Text>
                {m.is_default ? (
                  <View style={s.defaultBadge}><Text style={s.defaultText}>Default</Text></View>
                ) : (
                  <Pressable onPress={() => handleSetDefault(m.id)} hitSlop={8}>
                    <Text style={s.setDefaultText}>Set default</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => handleDeleteMethod(m.id)} hitSlop={8} style={s.deleteMethodBtn}>
                  <Trash2 size={16} color={Colors.destructive} strokeWidth={2} />
                </Pressable>
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
    </ScrollView>
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
  setDefaultText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  deleteMethodBtn: {
    marginLeft: Spacing.sm,
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
