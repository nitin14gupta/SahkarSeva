import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { CheckCircle2, Landmark, XCircle } from 'lucide-react-native'
import { AppHeader, EmptyState, Input, KeyboardAvoidingWrapper, LanguageChip, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { useVpaValidation } from '@/hooks/useVpaValidation'
import { useIfscLookup } from '@/hooks/useIfscLookup'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing, withOpacity } from '@/constants'
import type { PayoutAccount, PayoutMethod, PayoutSchedule } from '@/types/worker'

function maskAccountNumber(accountNumber: string | null): string {
  if (!accountNumber) return ''
  const last4 = accountNumber.slice(-4)
  return `${'•'.repeat(Math.max(0, accountNumber.length - 4))}${last4}`
}

const SCHEDULES: { key: PayoutSchedule; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
]

export default function WorkerPayoutScreen() {
  const show = usePillStore((s) => s.show)

  const [accounts, setAccounts] = useState<PayoutAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [schedule, setSchedule] = useState<PayoutSchedule>('weekly')
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [rzpKey, setRzpKey] = useState<string | null>(null)

  const [method, setMethod] = useState<PayoutMethod>('upi')
  const [upiId, setUpiId] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('')
  const [ifsc, setIfsc] = useState('')
  const [saving, setSaving] = useState(false)

  const { checking: vpaChecking, vpaResult, vpaError } = useVpaValidation(upiId, rzpKey)
  const { loading: bankLookupLoading, bankInfo, error: ifscError } = useIfscLookup(ifsc)
  const accountNumberMismatch = confirmAccountNumber.length > 0 && accountNumber !== confirmAccountNumber

  useEffect(() => {
    apiService.getPaymentPublicKey().then((r) => setRzpKey(r.key)).catch(() => {})
  }, [])

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        setLoading(true)
        try {
          const [{ accounts }, { worker }] = await Promise.all([
            apiService.getPayoutAccounts(),
            apiService.getWorkerMe(),
          ])
          if (cancelled) return
          setAccounts(accounts)
          setSchedule(worker.payout_schedule)
        } catch {
          if (!cancelled) show('Could not load your payout details', 'error')
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => { cancelled = true }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- `show` is a stable zustand setter
    }, [])
  )

  async function handleChangeSchedule(next: PayoutSchedule) {
    setSchedule(next)
    setSavingSchedule(true)
    try {
      await apiService.updateWorkerProfile({ payout_schedule: next })
    } catch {
      show('Could not update payout schedule', 'error')
    } finally {
      setSavingSchedule(false)
    }
  }

  const canSubmitUpi = !!vpaResult && !vpaError
  const canSubmitBank =
    accountHolder.trim().length >= 2 &&
    accountNumber.trim().length > 0 &&
    accountNumber === confirmAccountNumber &&
    !!bankInfo
  const isValid = method === 'upi' ? canSubmitUpi : canSubmitBank

  async function handleAddAccount() {
    if (!isValid) return
    setSaving(true)
    try {
      const { account } = await apiService.addPayoutAccount({
        method,
        upi_id: method === 'upi' ? upiId.trim() : undefined,
        account_holder: method === 'bank' ? accountHolder.trim() : undefined,
        account_number: method === 'bank' ? accountNumber.trim() : undefined,
        ifsc: method === 'bank' ? ifsc.trim().toUpperCase() : undefined,
        is_default: accounts.length === 0,
      })
      setAccounts((prev) => [account, ...prev])
      setUpiId('')
      setAccountHolder('')
      setAccountNumber('')
      setConfirmAccountNumber('')
      setIfsc('')
      show('Payout account added', 'success')
    } catch {
      show('Could not save this account', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={s.container}>
      <AppHeader title="Payout & bank linking" showBack />
      <KeyboardAvoidingWrapper transparent>
        <ScrollView style={s.inner} contentContainerStyle={s.innerContent}>
          <Text style={s.sectionLabel}>Payout schedule</Text>
          <View style={s.chipRow}>
            {SCHEDULES.map((sch) => (
              <LanguageChip
                key={sch.key}
                label={sch.label}
                selected={schedule === sch.key}
                onPress={() => handleChangeSchedule(sch.key)}
              />
            ))}
          </View>
          {savingSchedule && <ActivityIndicator color={Colors.brandGreen} style={s.scheduleSpinner} />}

          <Text style={[s.sectionLabel, s.sectionGap]}>Linked accounts</Text>
          {loading ? (
            <ActivityIndicator color={Colors.brandGreen} />
          ) : accounts.length === 0 ? (
            <EmptyState icon={Landmark} title="No payout account linked yet" />
          ) : (
            accounts.map((acc) => (
              <View key={acc.id} style={s.accountCard}>
                <Landmark size={18} color={Colors.brandGreen} strokeWidth={2} />
                <View style={{ flex: 1 }}>
                  <Text style={s.accountTitle}>
                    {acc.method === 'upi' ? acc.upi_id : `${acc.account_holder} · ${maskAccountNumber(acc.account_number)}`}
                  </Text>
                  <Text style={s.accountSubtitle}>{acc.method === 'upi' ? 'UPI' : `Bank · ${acc.ifsc}`}{acc.is_default ? ' · Default' : ''}</Text>
                </View>
              </View>
            ))
          )}

          <Text style={[s.sectionLabel, s.sectionGap]}>Add a payout account</Text>
          <View style={s.chipRow}>
            <LanguageChip label="UPI" selected={method === 'upi'} onPress={() => setMethod('upi')} />
            <LanguageChip label="Bank account" selected={method === 'bank'} onPress={() => setMethod('bank')} />
          </View>

          <View style={s.form}>
            {method === 'upi' ? (
              <>
                <Input
                  value={upiId}
                  onChangeText={(v) => setUpiId(v.toLowerCase().trim())}
                  placeholder="yourname@upi"
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
                <Input value={accountHolder} onChangeText={setAccountHolder} placeholder="Account holder name" style={s.fieldGap} />
                <Input
                  value={accountNumber}
                  onChangeText={(v) => setAccountNumber(v.replace(/[^0-9]/g, ''))}
                  placeholder="Account number"
                  keyboardType="number-pad"
                  secureTextEntry
                  style={s.fieldGap}
                />
                <Input
                  value={confirmAccountNumber}
                  onChangeText={(v) => setConfirmAccountNumber(v.replace(/[^0-9]/g, ''))}
                  placeholder="Confirm account number"
                  keyboardType="number-pad"
                  error={accountNumberMismatch ? "Account numbers don't match" : undefined}
                  style={s.fieldGap}
                />
                <Input value={ifsc} onChangeText={(v) => setIfsc(v.toUpperCase())} placeholder="IFSC code" autoCapitalize="characters" />

                {bankLookupLoading && (
                  <View style={s.statusRow}>
                    <ActivityIndicator size="small" color={Colors.textSecondary} />
                    <Text style={s.statusText}>Looking up bank…</Text>
                  </View>
                )}
                {!bankLookupLoading && bankInfo && (
                  <View style={[s.statusRow, s.statusRowSuccess]}>
                    <CheckCircle2 size={16} color={Colors.brandGreen} strokeWidth={2} />
                    <Text style={s.statusTextSuccess}>{bankInfo.bank} — {bankInfo.branch}</Text>
                  </View>
                )}
                {!bankLookupLoading && ifscError && (
                  <View style={[s.statusRow, s.statusRowError]}>
                    <XCircle size={16} color={Colors.destructive} strokeWidth={2} />
                    <Text style={s.statusTextError}>Could not verify this IFSC code</Text>
                  </View>
                )}
              </>
            )}
          </View>

          <PrimaryButton label="Save account" onPress={handleAddAccount} disabled={!isValid} loading={saving} />
        </ScrollView>
      </KeyboardAvoidingWrapper>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, paddingHorizontal: Spacing.screenPadding },
  innerContent: { paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  sectionLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  sectionGap: { marginTop: Spacing.lg },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  scheduleSpinner: { marginBottom: Spacing.sm },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: Spacing.sm,
  },
  accountTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  accountSubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  fieldGap: { marginBottom: Spacing.sm },
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
})
