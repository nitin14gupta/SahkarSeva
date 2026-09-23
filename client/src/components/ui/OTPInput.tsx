import React, { useRef } from 'react'
import { NativeSyntheticEvent, StyleSheet, TextInput, TextInputKeyPressEventData, View } from 'react-native'
import { Colors, ComponentSize, FontFamily, Radius, Spacing } from '@/constants'

const LENGTH = 6

interface OTPInputProps {
  value: string
  onChange: (code: string) => void
  error?: boolean
  autoFocus?: boolean
}

export function OTPInput({ value, onChange, error, autoFocus }: OTPInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([])
  const digits = value.split('')

  function setDigit(index: number, digit: string) {
    const next = value.split('')
    next[index] = digit
    const joined = next.join('').slice(0, LENGTH)
    onChange(joined)
    if (digit && index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyPress(index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <View style={s.row}>
      {Array.from({ length: LENGTH }).map((_, i) => (
        <TextInput
          key={i}
          ref={(ref) => { inputRefs.current[i] = ref }}
          value={digits[i] ?? ''}
          onChangeText={(t) => setDigit(i, t.replace(/[^0-9]/g, '').slice(-1))}
          onKeyPress={(e) => handleKeyPress(i, e)}
          keyboardType="number-pad"
          maxLength={1}
          autoFocus={autoFocus && i === 0}
          style={[s.box, error && s.boxError]}
        />
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  box: {
    flex: 1,
    height: ComponentSize.otpBoxHeight,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
    textAlign: 'center',
    fontFamily: FontFamily.headingBold,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  boxError: {
    borderColor: Colors.destructive,
  },
})
