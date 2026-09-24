import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { UserRound } from 'lucide-react-native'
import { Colors } from '@/constants'

interface AvatarProps {
  uri?: string | null
  size?: number
}

export function Avatar({ uri, size = 48 }: AvatarProps) {
  const style = { width: size, height: size, borderRadius: size / 2 }

  if (!uri) {
    return (
      <View style={[s.fallback, style]}>
        <UserRound size={size * 0.5} color={Colors.textSecondary} strokeWidth={1.5} />
      </View>
    )
  }

  return <Image source={{ uri }} style={style} />
}

const s = StyleSheet.create({
  fallback: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
