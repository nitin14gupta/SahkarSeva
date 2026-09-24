import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Colors, FontFamily, Spacing } from '@/constants'

interface StatusStepperProps {
  steps: string[]
  currentIndex: number
  isRejected?: boolean
}

export function StatusStepper({ steps, currentIndex, isRejected }: StatusStepperProps) {
  return (
    <View style={s.row}>
      {steps.map((label, i) => {
        const isLast = i === steps.length - 1
        const reached = i <= currentIndex
        const dotColor = isRejected && isLast && reached ? Colors.destructive : reached ? Colors.brandGreen : Colors.divider
        const lineColor = i < currentIndex ? Colors.brandGreen : Colors.divider

        return (
          <View key={label} style={s.step}>
            <View style={s.stepTrack}>
              <View style={[s.dot, { backgroundColor: dotColor }]} />
              {!isLast && <View style={[s.line, { backgroundColor: lineColor }]} />}
            </View>
            <Text style={[s.label, reached && s.labelActive]} numberOfLines={2}>{label}</Text>
          </View>
        )
      })}
    </View>
  )
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  step: {
    flex: 1,
    alignItems: 'center',
  },
  stepTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  line: {
    flex: 1,
    height: 2,
  },
  label: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  labelActive: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.textPrimary,
  },
})
