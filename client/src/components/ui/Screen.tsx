import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors } from '@/constants'

interface ScreenProps {
  children: React.ReactNode
}

export function Screen({ children }: ScreenProps) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {children}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
})
