import React from 'react'
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native'
import { Colors, ComponentSize, FontFamily, Radius } from '@/constants'

interface InputProps extends TextInputProps {
  error?: string
}

export function Input({ error, style, ...rest }: InputProps) {
  return (
    <View>
      <TextInput
        placeholderTextColor={Colors.inkDisabled}
        style={[s.input, !!error && s.inputError, style]}
        {...rest}
      />
      {!!error && <Text style={s.errorText}>{error}</Text>}
    </View>
  )
}

const s = StyleSheet.create({
  input: {
    height: ComponentSize.inputHeight,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.destructive,
  },
  errorText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.destructive,
    marginTop: 4,
  },
})
