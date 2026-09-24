import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BackButton, Input, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { PaymentMethodType } from '@/types/payment'

export default function AddPaymentMethodScreen() {
  const insets = useSafeAreaInsets()
  const show = usePillStore((s) => s.show)
  const [type, setType] = useState<PaymentMethodType>('upi')
  const [upiId, setUpiId] = useState('')
  const [cardLast4, setCardLast4] = useState('')
  const [cardBrand, setCardBrand] = useState('')
  const [saving, setSaving] = useState(false)

  const isValid = type === 'upi' ? upiId.trim().includes('@') : cardLast4.trim().length === 4

  async function handleSave() {
    if (!isValid) return
    setSaving(true)
    try {
      await apiService.addPaymentMethod({
        type,
        upi_id: type === 'upi' ? upiId.trim() : undefined,
        card_last4: type === 'card' ? cardLast4.trim() : undefined,
        card_brand: type === 'card' ? cardBrand.trim() || undefined : undefined,
      })
      show('Payment method saved', 'success')
      router.back()
    } catch {
      show('Could not save payment method', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.topRow}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Add payment method</Text>
      </View>

      <View style={s.content}>
        <View style={s.typeRow}>
          <Pressable style={[s.typeChip, type === 'upi' && s.typeChipSelected]} onPress={() => setType('upi')}>
            <Text style={[s.typeText, type === 'upi' && s.typeTextSelected]}>UPI</Text>
          </Pressable>
          <Pressable style={[s.typeChip, type === 'card' && s.typeChipSelected]} onPress={() => setType('card')}>
            <Text style={[s.typeText, type === 'card' && s.typeTextSelected]}>Card</Text>
          </Pressable>
        </View>

        {type === 'upi' ? (
          <Input placeholder="yourname@upi" value={upiId} onChangeText={setUpiId} autoCapitalize="none" />
        ) : (
          <>
            <Input placeholder="Card brand (e.g. Visa)" value={cardBrand} onChangeText={setCardBrand} />
            <View style={{ height: Spacing.sm }} />
            <Input placeholder="Last 4 digits" value={cardLast4} onChangeText={setCardLast4} keyboardType="number-pad" maxLength={4} />
          </>
        )}
      </View>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label="Save" onPress={handleSave} disabled={!isValid} loading={saving} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  typeChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  typeChipSelected: {
    borderColor: Colors.brandGreen,
    backgroundColor: Colors.brandGreen,
  },
  typeText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  typeTextSelected: {
    color: Colors.inkOnAccent,
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
})
