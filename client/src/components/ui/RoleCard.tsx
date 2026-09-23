import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { LucideIcon } from 'lucide-react-native'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'

interface RoleCardProps {
  icon: LucideIcon
  title: string
  subtitle: string
  selected: boolean
  onPress: () => void
}

export function RoleCard({ icon: Icon, title, subtitle, selected, onPress }: RoleCardProps) {
  return (
    <Pressable onPress={onPress} style={[s.card, selected && s.cardSelected]}>
      <View style={[s.iconWrap, selected && s.iconWrapSelected]}>
        <Icon size={26} color={selected ? Colors.inkOnAccent : Colors.brandGreen} strokeWidth={2} />
      </View>
      <Text style={s.title}>{title}</Text>
      <Text style={s.subtitle}>{subtitle}</Text>
    </Pressable>
  )
}

const s = StyleSheet.create({
  card: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  cardSelected: {
    borderColor: Colors.brandGreen,
    backgroundColor: 'rgba(31,77,58,0.05)',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(31,77,58,0.08)',
    marginBottom: Spacing.md,
  },
  iconWrapSelected: {
    backgroundColor: Colors.brandGreen,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
})
