import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { CheckCircle2, XCircle } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { AppHeader, Input, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { useVpaValidation } from '@/hooks/useVpaValidation'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing, withOpacity } from '@/constants'

export default function AddPaymentMethodScreen() {
  const { t } = useTranslation('customer')
  const insets = useSafeAreaInsets()
  const show = usePillStore((s) => s.show)
  const [upiId, setUpiId] = useState('')
  const [saving, setSaving] = useState(false)
  const [rzpKey, setRzpKey] = useState<string | null>(null)

  const { checking: vpaChecking, vpaResult, vpaError } = useVpaValidation(upiId, rzpKey)

  useEffect(() => {
    apiService.getPaymentPublicKey().then((r) => setRzpKey(r.key)).catch(() => {})
  }, [])

  const isValid = !!vpaResult && !vpaError

  async function handleSave() {
    if (!isValid) return
    setSaving(true)
    try {
      await apiService.addPaymentMethod({ type: 'upi', upi_id: upiId.trim() })
      show(t('paymentMethodsAdd.saveSuccess'), 'success')
      router.back()
    } catch {
      show(t('paymentMethodsAdd.saveError'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={s.container}>
      <AppHeader title={t('paymentMethodsAdd.title')} showBack />

      <View style={s.content}>
        <Input
          placeholder={t('paymentMethodsAdd.placeholder')}
          value={upiId}
          onChangeText={(v) => setUpiId(v.toLowerCase().trim())}
          autoCapitalize="none"
        />

        {vpaChecking && (
          <View style={s.statusRow}>
            <ActivityIndicator size="small" color={Colors.textSecondary} />
            <Text style={s.statusText}>{t('paymentMethodsAdd.verifying')}</Text>
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
            <Text style={s.statusTextError}>{t('paymentMethodsAdd.verifyError')}</Text>
          </View>
        )}
      </View>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label={t('common:save')} onPress={handleSave} disabled={!isValid} loading={saving} />
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
