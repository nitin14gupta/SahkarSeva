import React from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { Colors, ComponentSize, FontFamily, Radius, Spacing } from '@/constants'

interface PhoneInputProps {
  value: string
  onChangeText: (text: string) => void
  error?: string
  autoFocus?: boolean
}

export function PhoneInput({ value, onChangeText, error, autoFocus }: PhoneInputProps) {
  return (
    <View>
      <View style={[s.wrap, !!error && s.wrapError]}>
        <Text style={s.prefix}>+91</Text>
        <View style={s.divider} />
        <TextInput
          value={value}
          onChangeText={(t) => onChangeText(t.replace(/[^0-9]/g, '').slice(0, 10))}
          keyboardType="number-pad"
          maxLength={10}
          autoFocus={autoFocus}
          placeholder="98765 43210"
          placeholderTextColor={Colors.inkDisabled}
          style={s.input}
        />
      </View>
      {!!error && <Text style={s.errorText}>{error}</Text>}
    </View>
  )
}

const s = StyleSheet.create({
  wrap: {
    height: ComponentSize.inputPhoneHeight,
    borderRadius: Radius.inputLg,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  wrapError: {
    borderColor: Colors.destructive,
  },
  prefix: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  errorText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.destructive,
    marginTop: Spacing.xs,
  },
})
