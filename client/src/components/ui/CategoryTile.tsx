import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Colors, FontFamily, withOpacity } from '@/constants'
import { CategoryIcon } from './CategoryIcon'

interface CategoryTileProps {
  name: string
  icon: string
  onPress: () => void
}

export function CategoryTile({ name, icon, onPress }: CategoryTileProps) {
  return (
    <Pressable style={s.tile} onPress={onPress}>
      <View style={s.iconWrap}>
        <CategoryIcon name={icon} size={22} />
      </View>
      <Text style={s.label} numberOfLines={1}>{name}</Text>
    </Pressable>
  )
}

const s = StyleSheet.create({
  tile: {
    width: 76,
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: withOpacity(Colors.brandGreen, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
})
