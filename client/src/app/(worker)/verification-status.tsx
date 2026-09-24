import { useCallback, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ClipboardCheck } from 'lucide-react-native'
import { PrimaryButton, SecondaryButton, StatusBadge } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { Colors, FontFamily, Spacing } from '@/constants'
import type { WorkerProfile } from '@/types/worker'

const COPY: Record<WorkerProfile['verification_status'], { title: string; body: string }> = {
  pending: {
    title: 'Your documents are under review',
    body: 'Your cooperative usually reviews new registrations within 1–2 business days. We’ll let you know as soon as you’re verified.',
  },
  verified: {
    title: 'You’re verified!',
    body: 'You can now go online and start receiving job requests.',
  },
  rejected: {
    title: 'Verification unsuccessful',
    body: 'Your cooperative flagged an issue with your submission. Review the reason below and re-submit your documents.',
  },
}

export default function WorkerVerificationStatusScreen() {
  const insets = useSafeAreaInsets()
  const [worker, setWorker] = useState<WorkerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { worker } = await apiService.getWorkerMe()
      setWorker(worker)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        setLoading(true)
        try {
          const { worker } = await apiService.getWorkerMe()
          if (!cancelled) setWorker(worker)
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => { cancelled = true }
    }, [])
  )

  if (loading && !worker) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator color={Colors.brandGreen} />
      </View>
    )
  }

  if (!worker) {
    return (
      <View style={[s.container, s.center]}>
        <Text style={s.errorText}>Couldn&apos;t load your status.</Text>
        <SecondaryButton label="Retry" onPress={load} />
      </View>
    )
  }

  const status = worker.verification_status
  const copy = COPY[status]
  const tone = status === 'verified' ? 'success' : status === 'rejected' ? 'error' : 'pending'
  const label = status === 'verified' ? 'Verified' : status === 'rejected' ? 'Rejected' : 'Pending review'

  return (
    <View style={s.container}>
      <View style={s.inner}>
        <View style={s.iconWrap}>
          <ClipboardCheck size={32} color={Colors.brandGreen} strokeWidth={1.5} />
        </View>
        <StatusBadge tone={tone} label={label} />
        <Text style={s.title}>{copy.title}</Text>
        <Text style={s.body}>{copy.body}</Text>

        {status === 'rejected' && !!worker.verification_reason && (
          <View style={s.reasonBox}>
            <Text style={s.reasonLabel}>Reason</Text>
            <Text style={s.reasonText}>{worker.verification_reason}</Text>
          </View>
        )}
      </View>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {status === 'verified' && (
          <PrimaryButton label="Go to Dashboard" onPress={() => router.replace('/(worker)/(tabs)/home')} />
        )}
        {status === 'rejected' && (
          <PrimaryButton
            label="Re-submit documents"
            onPress={() => router.push({ pathname: '/register/documents', params: { mode: 'resubmit' } })}
          />
        )}
        {status === 'pending' && (
          <SecondaryButton label="Refresh status" onPress={load} loading={loading} />
        )}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xxl * 1.5,
    alignItems: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(31,77,58,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 22,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: 8,
  },
  body: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  reasonBox: {
    width: '100%',
    marginTop: Spacing.xl,
    padding: Spacing.md,
    borderRadius: 14,
    backgroundColor: 'rgba(214,69,69,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(214,69,69,0.2)',
  },
  reasonLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.destructive,
    marginBottom: 4,
  },
  reasonText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  footer: { paddingHorizontal: Spacing.screenPadding },
})
