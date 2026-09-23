import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import { Colors, ComponentSize } from '@/constants'

interface BackButtonProps {
  onPress: () => void
  transparent?: boolean
}

export function BackButton({ onPress, transparent }: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.btn, transparent ? s.btnTransparent : s.btnSolid]}
      hitSlop={8}
    >
      <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
    </Pressable>
  )
}

const s = StyleSheet.create({
  btn: {
    width: ComponentSize.backBtn,
    height: ComponentSize.backBtn,
    borderRadius: ComponentSize.backBtn / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSolid: {
    backgroundColor: Colors.surface,
  },
  btnTransparent: {
    backgroundColor: 'transparent',
  },
})
