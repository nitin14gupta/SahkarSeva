import React from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { Colors, ComponentSize, FontFamily, Radius } from '@/constants'

interface SecondaryButtonProps {
  label: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
}

export function SecondaryButton({ label, onPress, disabled, loading }: SecondaryButtonProps) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        s.btn,
        isDisabled && s.btnDisabled,
        pressed && !isDisabled && s.btnPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.brandGreen} />
      ) : (
        <Text style={[s.label, isDisabled && s.labelDisabled]}>{label}</Text>
      )}
    </Pressable>
  )
}

const s = StyleSheet.create({
  btn: {
    height: ComponentSize.btnPrimary,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.brandGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    backgroundColor: 'rgba(31,77,58,0.06)',
  },
  btnDisabled: {
    borderColor: Colors.inkDisabled,
  },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 16,
    color: Colors.brandGreen,
  },
  labelDisabled: {
    color: Colors.inkDisabled,
  },
})
