import React, { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { Colors, ComponentSize, FontFamily, Radius } from '@/constants'

interface PrimaryButtonProps {
  label: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
}

export function PrimaryButton({ label, onPress, disabled, loading }: PrimaryButtonProps) {
  const isDisabled = disabled || loading
  const [pressed, setPressed] = useState(false)

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={isDisabled}
      style={[
        s.btn,
        isDisabled && s.btnDisabled,
        pressed && !isDisabled && s.btnPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.inkOnAccent} />
      ) : (
        <Text style={s.label}>{label}</Text>
      )}
    </Pressable>
  )
}

const s = StyleSheet.create({
  btn: {
    height: ComponentSize.btnPrimary,
    borderRadius: Radius.pill,
    backgroundColor: Colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    opacity: 0.9,
  },
  btnDisabled: {
    backgroundColor: Colors.inkDisabled,
  },
  label: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 16,
    color: Colors.inkOnAccent,
  },
})
