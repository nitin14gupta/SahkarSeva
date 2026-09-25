import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Landmark } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { EarningsChart, EmptyState, LanguageChip } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { EarningsRange, EarningsSummary } from '@/types/worker'

export default function WorkerEarningsScreen() {
  const { t } = useTranslation('worker')
  const insets = useSafeAreaInsets()
  const show = usePillStore((s) => s.show)
  const RANGES: { key: EarningsRange; label: string }[] = [
    { key: 'daily', label: t('earnings.rangeDaily') },
    { key: 'weekly', label: t('earnings.rangeWeekly') },
    { key: 'monthly', label: t('earnings.rangeMonthly') },
  ]
  const [range, setRange] = useState<EarningsRange>('weekly')
  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        setLoading(true)
        try {
          const { summary } = await apiService.getEarningsSummary(range)
          if (!cancelled) setSummary(summary)
        } catch {
          if (!cancelled) show(t('earnings.loadError'), 'error')
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => { cancelled = true }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- `show` is a stable zustand setter
    }, [range])
  )

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const { summary } = await apiService.getEarningsSummary(range)
      setSummary(summary)
    } catch {
      // keep whatever was already showing — the pull gesture retrying silently is fine
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + Spacing.md, paddingBottom: Spacing.xxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.brandGreen]} tintColor={Colors.brandGreen} />}
      >
        <Text style={s.title}>{t('earnings.title')}</Text>

        <View style={s.rangeRow}>
          {RANGES.map((r) => (
            <LanguageChip key={r.key} label={r.label} selected={range === r.key} onPress={() => setRange(r.key)} />
          ))}
        </View>

        {loading ? (
          <View style={s.center}><ActivityIndicator color={Colors.brandGreen} /></View>
        ) : !summary || summary.buckets.length === 0 ? (
          <EmptyState icon={Landmark} title={t('earnings.emptyTitle')} subtitle={t('earnings.emptySubtitle')} />
        ) : (
          <>
            <View style={s.chartCard}>
              <EarningsChart buckets={summary.buckets} />
            </View>

            <View style={s.statsRow}>
              <View style={s.statCard}>
                <Text style={s.statValue}>{summary.total_jobs}</Text>
                <Text style={s.statLabel}>{t('earnings.jobsCompleted')}</Text>
              </View>
              <View style={s.statCard}>
                <Text style={s.statValue}>₹{summary.total_gross}</Text>
                <Text style={s.statLabel}>{t('earnings.grossEarned')}</Text>
              </View>
            </View>

            <View style={s.breakdownCard}>
              <Text style={s.breakdownTitle}>{t('earnings.breakdownTitle')}</Text>
              <View style={s.breakdownRow}>
                <Text style={s.breakdownLabel}>{t('earnings.gross')}</Text>
                <Text style={s.breakdownValue}>₹{summary.total_gross}</Text>
              </View>
              <View style={s.breakdownRow}>
                <Text style={[s.breakdownLabel, s.feeLabel]}>{t('earnings.cooperativeFee', { pct: summary.commission_pct })}</Text>
                <Text style={[s.breakdownValue, s.feeLabel]}>−₹{summary.total_commission}</Text>
              </View>
              <View style={s.divider} />
              <View style={s.breakdownRow}>
                <Text style={s.netLabel}>{t('earnings.youKeep')}</Text>
                <Text style={s.netValue}>₹{summary.total_net}</Text>
              </View>
            </View>
          </>
        )}

        <Pressable style={s.payoutLink} onPress={() => router.push('/payout')}>
          <Landmark size={16} color={Colors.brandGreen} strokeWidth={2} />
          <Text style={s.payoutLinkText}>{t('earnings.payoutLink')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { paddingVertical: Spacing.xxl, alignItems: 'center' },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 22,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  chartCard: {
    marginHorizontal: Spacing.screenPadding,
    padding: Spacing.md,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.md,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  statValue: {
    fontFamily: FontFamily.headingBold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  breakdownCard: {
    marginHorizontal: Spacing.screenPadding,
    padding: Spacing.lg,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: Spacing.lg,
  },
  breakdownTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  feeLabel: {
    color: Colors.gold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.sm,
  },
  netLabel: {
    fontFamily: FontFamily.headingBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  netValue: {
    fontFamily: FontFamily.headingBold,
    fontSize: 16,
    color: Colors.brandGreen,
  },
  payoutLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.sm,
  },
  payoutLinkText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.brandGreen,
  },
})
