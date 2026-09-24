import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Colors, FontFamily, Radius, Spacing, withOpacity } from '@/constants'

type StatusTone = 'pending' | 'success' | 'error'

interface StatusBadgeProps {
  tone: StatusTone
  label: string
}

const TONE_COLOR: Record<StatusTone, string> = {
  pending: Colors.gold,
  success: Colors.brandGreen,
  error: Colors.destructive,
}

export function StatusBadge({ tone, label }: StatusBadgeProps) {
  const color = TONE_COLOR[tone]
  return (
    <View style={[s.badge, { backgroundColor: withOpacity(color, 0.12) }]}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <Text style={[s.label, { color }]}>{label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
  },
})
