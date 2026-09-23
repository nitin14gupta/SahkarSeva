import React from 'react'
import { Image, ImageStyle, StyleProp } from 'react-native'
import { Logo } from '@/constants'

interface LogoMarkProps {
  size?: number
  opacity?: number
  style?: StyleProp<ImageStyle>
}

export function LogoMark({ size = 32, opacity = 1, style }: LogoMarkProps) {
  return (
    <Image
      source={Logo}
      style={[{ width: size, height: size, opacity }, style]}
      resizeMode="contain"
    />
  )
}
