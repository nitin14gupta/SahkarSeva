import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { Colors, FontFamily, withOpacity } from '@/constants'

interface CountdownRingProps {
  /** 0 (empty) → 1 (full) remaining fraction. */
  progress: number
  seconds: number
  size?: number
  strokeWidth?: number
}

export function CountdownRing({ progress, seconds, size = 64, strokeWidth = 5 }: CountdownRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)))

  return (
    <View style={[s.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={withOpacity(Colors.terracotta, 0.15)}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.terracotta}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={s.label}>{seconds}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    fontFamily: FontFamily.headingBold,
    fontSize: 18,
    color: Colors.terracotta,
  },
})
