import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { Colors, FontFamily, Spacing } from '@/constants'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  subtitle?: string
}

export function EmptyState({ icon: Icon, title, subtitle }: EmptyStateProps) {
  return (
    <View style={s.container}>
      <View style={s.iconWrap}>
        <Icon size={28} color={Colors.textSecondary} strokeWidth={1.5} />
      </View>
      <Text style={s.title}>{title}</Text>
      {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 15,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
})
