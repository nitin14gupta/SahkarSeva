import React from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import { Colors } from '@/constants'

interface KeyboardAvoidingWrapperProps {
  children: React.ReactNode
  transparent?: boolean
}

export function KeyboardAvoidingWrapper({ children, transparent }: KeyboardAvoidingWrapperProps) {
  return (
    <KeyboardAvoidingView
      style={[s.flex, !transparent && s.bg]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {children}
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  flex: {
    flex: 1,
  },
  bg: {
    backgroundColor: Colors.background,
  },
})
