import { useCallback, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { AppHeader, Input, KeyboardAvoidingWrapper, PrimaryButton, StatusStepper } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, DESCRIPTION_MAX_LENGTH, DESCRIPTION_MIN_LENGTH, FontFamily, Radius, Spacing } from '@/constants'
import type { WelfareClaim } from '@/types/worker'

const STEPS = ['Submitted', 'Under Review', 'Approved']
const STEP_INDEX: Record<string, number> = { submitted: 0, under_review: 1, approved: 2, rejected: 2 }
const ACTIVE_STATUSES = new Set(['submitted', 'under_review'])

export default function WorkerClaimScreen() {
  const show = usePillStore((s) => s.show)

  const [claims, setClaims] = useState<WelfareClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [reason, setReason] = useState('')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        setLoading(true)
        try {
          const { claims } = await apiService.getWelfareClaims()
          if (!cancelled) setClaims(claims)
        } catch {
          if (!cancelled) show('Could not load your claims', 'error')
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => { cancelled = true }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- `show` is a stable zustand setter
    }, [])
  )

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const { claims } = await apiService.getWelfareClaims()
      setClaims(claims)
    } catch {
      // keep whatever was already showing — the pull gesture retrying silently is fine
    } finally {
      setRefreshing(false)
    }
  }

  const activeClaim = claims.find((c) => ACTIVE_STATUSES.has(c.status))
  const pastClaims = claims.filter((c) => c.id !== activeClaim?.id)

  const reasonLength = reason.trim().length
  const reasonValid = reasonLength >= DESCRIPTION_MIN_LENGTH && reasonLength <= DESCRIPTION_MAX_LENGTH

  async function handleSubmit() {
    if (!reasonValid) return
    setSubmitting(true)
    try {
      const { claim } = await apiService.createWelfareClaim({
        reason: reason.trim(),
        amount_claimed: amount ? Number(amount) : undefined,
      })
      setClaims((prev) => [claim, ...prev])
      setReason('')
      setAmount('')
      show('Claim submitted', 'success')
    } catch {
      show('Could not submit your claim', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={s.container}>
      <AppHeader title="Welfare claim" showBack />
      {loading ? (
        <View style={s.center}><ActivityIndicator color={Colors.brandGreen} /></View>
      ) : (
        <KeyboardAvoidingWrapper transparent>
          <ScrollView
            style={s.inner}
            contentContainerStyle={s.innerContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.brandGreen]} tintColor={Colors.brandGreen} />}
          >
            {activeClaim ? (
              <View style={s.card}>
                <Text style={s.cardTitle}>Your claim</Text>
                <Text style={s.claimReason}>{activeClaim.reason}</Text>
                <View style={s.stepperWrap}>
                  <StatusStepper steps={STEPS} currentIndex={STEP_INDEX[activeClaim.status]} />
                </View>
              </View>
            ) : (
              <View style={s.card}>
                <Text style={s.cardTitle}>Submit a claim</Text>
                <Text style={s.cardSubtitle}>Tell us what happened — your cooperative will review it.</Text>
                <Input
                  value={reason}
                  onChangeText={(v) => setReason(v.slice(0, DESCRIPTION_MAX_LENGTH))}
                  placeholder="Reason for claim"
                  multiline
                  numberOfLines={3}
                  style={s.reasonInput}
                />
                <Text style={[s.counter, reasonLength > 0 && !reasonValid && s.counterError]}>
                  {reasonLength}/{DESCRIPTION_MAX_LENGTH} · minimum {DESCRIPTION_MIN_LENGTH} characters
                </Text>
                <Input
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="Amount claimed (optional)"
                  keyboardType="number-pad"
                  style={s.fieldGap}
                />
                <PrimaryButton label="Submit claim" onPress={handleSubmit} disabled={!reasonValid} loading={submitting} />
              </View>
            )}

            {pastClaims.length > 0 && (
              <>
                <Text style={s.historyTitle}>Past claims</Text>
                {pastClaims.map((c) => (
                  <View key={c.id} style={s.historyCard}>
                    <Text style={s.historyReason} numberOfLines={2}>{c.reason}</Text>
                    <Text style={[s.historyStatus, c.status === 'rejected' && s.historyStatusRejected]}>
                      {c.status === 'approved' ? 'Approved' : c.status === 'rejected' ? 'Rejected' : c.status}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingWrapper>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  inner: { flex: 1, paddingHorizontal: Spacing.screenPadding },
  innerContent: { paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  claimReason: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  stepperWrap: { marginTop: Spacing.sm },
  reasonInput: {
    height: 88,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  counter: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  counterError: {
    color: Colors.destructive,
  },
  fieldGap: { marginBottom: Spacing.md },
  historyTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: Spacing.sm,
  },
  historyReason: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  historyStatus: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.brandGreen,
  },
  historyStatusRejected: {
    color: Colors.destructive,
  },
})
