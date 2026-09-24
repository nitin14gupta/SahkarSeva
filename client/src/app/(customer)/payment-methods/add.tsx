import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { CheckCircle2, XCircle } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppHeader, Input, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { useVpaValidation } from '@/hooks/useVpaValidation'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing, withOpacity } from '@/constants'
import type { PaymentMethodType } from '@/types/payment'

export default function AddPaymentMethodScreen() {
  const insets = useSafeAreaInsets()
  const show = usePillStore((s) => s.show)
  const [type, setType] = useState<PaymentMethodType>('upi')
  const [upiId, setUpiId] = useState('')
  const [cardLast4, setCardLast4] = useState('')
  const [cardBrand, setCardBrand] = useState('')
  const [saving, setSaving] = useState(false)
  const [rzpKey, setRzpKey] = useState<string | null>(null)

  const { checking: vpaChecking, vpaResult, vpaError } = useVpaValidation(upiId, rzpKey)

  useEffect(() => {
    apiService.getPaymentPublicKey().then((r) => setRzpKey(r.key)).catch(() => {})
  }, [])

  const isValid = type === 'upi' ? !!vpaResult && !vpaError : cardLast4.trim().length === 4

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
    <View style={s.container}>
      <AppHeader title="Add payment method" showBack />

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
          <>
            <Input
              placeholder="yourname@upi"
              value={upiId}
              onChangeText={(v) => setUpiId(v.toLowerCase().trim())}
              autoCapitalize="none"
            />

            {vpaChecking && (
              <View style={s.statusRow}>
                <ActivityIndicator size="small" color={Colors.textSecondary} />
                <Text style={s.statusText}>Verifying UPI ID…</Text>
              </View>
            )}
            {!vpaChecking && vpaResult && (
              <View style={[s.statusRow, s.statusRowSuccess]}>
                <CheckCircle2 size={16} color={Colors.brandGreen} strokeWidth={2} />
                <Text style={s.statusTextSuccess}>{vpaResult.name}</Text>
              </View>
            )}
            {!vpaChecking && vpaError && (
              <View style={[s.statusRow, s.statusRowError]}>
                <XCircle size={16} color={Colors.destructive} strokeWidth={2} />
                <Text style={s.statusTextError}>Couldn&apos;t verify this UPI ID</Text>
              </View>
            )}
          </>
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  statusText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusRowSuccess: {
    backgroundColor: withOpacity(Colors.brandGreen, 0.08),
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statusTextSuccess: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.brandGreen,
  },
  statusRowError: {
    backgroundColor: withOpacity(Colors.destructive, 0.08),
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statusTextError: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.destructive,
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
})
