import React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'

interface LanguageChipProps {
  label: string
  selected: boolean
  onPress: () => void
}

export function LanguageChip({ label, selected, onPress }: LanguageChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, selected && s.chipSelected]}
    >
      <Text style={[s.label, selected && s.labelSelected]}>{label}</Text>
    </Pressable>
  )
}

const s = StyleSheet.create({
  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  chipSelected: {
    borderColor: Colors.brandGreen,
    backgroundColor: Colors.brandGreen,
  },
  label: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  labelSelected: {
    color: Colors.inkOnAccent,
  },
})
