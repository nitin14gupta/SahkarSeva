import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Colors, FontFamily, Spacing } from '@/constants'
import type { EarningsBucket } from '@/types/worker'

interface EarningsChartProps {
  buckets: EarningsBucket[]
  height?: number
}

function formatPeriodLabel(period: string): string {
  const d = new Date(period)
  if (Number.isNaN(d.getTime())) return period
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function EarningsChart({ buckets, height = 120 }: EarningsChartProps) {
  const max = Math.max(...buckets.map((b) => b.net), 1)

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
      {buckets.map((b) => (
        <View key={b.period} style={s.col}>
          <View style={[s.barTrack, { height }]}>
            <View style={[s.bar, { height: Math.max(6, (b.net / max) * (height - 4)) }]} />
          </View>
          <Text style={s.value} numberOfLines={1}>₹{Math.round(b.net)}</Text>
          <Text style={s.label}>{formatPeriodLabel(b.period)}</Text>
        </View>
      ))}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  row: {
    gap: Spacing.md,
    paddingHorizontal: 2,
  },
  col: {
    width: 44,
    alignItems: 'center',
  },
  barTrack: {
    width: 24,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 24,
    borderRadius: 6,
    backgroundColor: Colors.brandGreen,
  },
  value: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.textPrimary,
    marginTop: 6,
  },
  label: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
})
