import React from 'react'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'
import { Search, X } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Colors, ComponentSize, FontFamily, Radius, Spacing } from '@/constants'

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  onSubmit?: () => void
  placeholder?: string
  autoFocus?: boolean
}

export function SearchBar({ value, onChangeText, onSubmit, placeholder, autoFocus }: SearchBarProps) {
  const { t } = useTranslation('common')
  return (
    <View style={s.wrap}>
      <Search size={18} color={Colors.textSecondary} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder ?? t('search.placeholder')}
        placeholderTextColor={Colors.inkDisabled}
        returnKeyType="search"
        autoFocus={autoFocus}
        style={s.input}
      />
      {!!value && (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <X size={16} color={Colors.textSecondary} strokeWidth={2} />
        </Pressable>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: ComponentSize.inputHeight,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.textPrimary,
  },
})
