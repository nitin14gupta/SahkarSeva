import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { CalendarClock, ClipboardCheck, Power } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { AppHeader, EmptyState, JobCard, NotificationBell, PrimaryButton, RatingStars, StatusBadge } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { useCurrentLocation } from '@/hooks/useCurrentLocation'
import { Colors, FontFamily, Radius, Spacing, withOpacity } from '@/constants'
import type { WorkerBookingSummary } from '@/types/booking'
import type { VerificationStatus, WorkerDashboardSummary } from '@/types/worker'

function jobHref(booking: WorkerBookingSummary) {
  const id = booking.id
  switch (booking.status) {
    case 'requested': return { pathname: '/job-request/[id]' as const, params: { id } }
    case 'en_route': return { pathname: '/job/[id]/navigate' as const, params: { id } }
    case 'in_progress': return { pathname: '/job/[id]/in-progress' as const, params: { id } }
    default: return { pathname: '/job/[id]/details' as const, params: { id } }
  }
}

export default function WorkerHomeScreen() {
  const { t } = useTranslation('worker')
  const show = usePillStore((s) => s.show)
  const { lat, lng } = useCurrentLocation()

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null)
  const [verificationReason, setVerificationReason] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<WorkerDashboardSummary | null>(null)
  const [jobs, setJobs] = useState<WorkerBookingSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [togglingOnline, setTogglingOnline] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        setLoading(true)
        try {
          const { worker } = await apiService.getWorkerMe()
          if (cancelled) return
          setVerificationStatus(worker.verification_status)
          setVerificationReason(worker.verification_reason)

          if (worker.verification_status !== 'verified') {
            setLoading(false)
            return
          }

          const [{ dashboard }, { bookings }] = await Promise.all([
            apiService.getWorkerDashboard(),
            apiService.getWorkerBookings('active'),
          ])
          if (cancelled) return
          setDashboard(dashboard)
          const { bookings: incoming } = await apiService.getWorkerBookings('incoming')
          if (cancelled) return
          setJobs([...incoming, ...bookings])
        } catch {
          if (!cancelled) show(t('home.loadError'), 'error')
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => { cancelled = true }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch on focus only, not on every render
    }, [])
  )

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const { worker } = await apiService.getWorkerMe()
      setVerificationStatus(worker.verification_status)
      setVerificationReason(worker.verification_reason)
      if (worker.verification_status === 'verified') {
        const [{ dashboard }, { bookings }, { bookings: incoming }] = await Promise.all([
          apiService.getWorkerDashboard(),
          apiService.getWorkerBookings('active'),
          apiService.getWorkerBookings('incoming'),
        ])
        setDashboard(dashboard)
        setJobs([...incoming, ...bookings])
      }
    } catch {
      show(t('home.refreshError'), 'error')
    } finally {
      setRefreshing(false)
    }
  }

  async function handleToggleOnline() {
    if (!dashboard) return
    setTogglingOnline(true)
    const next = !dashboard.is_online
    try {
      await apiService.setWorkerOnline({ is_online: next, lat, lng })
      setDashboard((prev) => (prev ? { ...prev, is_online: next } : prev))
    } catch {
      show(t('home.statusUpdateError'), 'error')
    } finally {
      setTogglingOnline(false)
    }
  }

  if (loading && verificationStatus === null) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator color={Colors.brandGreen} />
      </View>
    )
  }

  if (verificationStatus && verificationStatus !== 'verified') {
    const isRejected = verificationStatus === 'rejected'
    return (
      <View style={s.container}>
        <AppHeader showLogo rightAction={<NotificationBell />} />
        <View style={s.gateWrap}>
          <View style={s.gateIconWrap}>
            <ClipboardCheck size={32} color={Colors.brandGreen} strokeWidth={1.5} />
          </View>
          <StatusBadge tone={isRejected ? 'error' : 'pending'} label={isRejected ? t('home.rejectedBadge') : t('home.pendingBadge')} />
          <Text style={s.gateTitle}>
            {isRejected ? t('home.verificationFailedTitle') : t('home.pendingReviewTitle')}
          </Text>
          <Text style={s.gateBody}>
            {isRejected ? t('home.rejectedBody') : t('home.pendingBody')}
          </Text>
          {isRejected && !!verificationReason && (
            <View style={s.reasonBox}>
              <Text style={s.reasonLabel}>{t('home.reasonLabel')}</Text>
              <Text style={s.reasonText}>{verificationReason}</Text>
            </View>
          )}
          {isRejected && (
            <View style={s.gateAction}>
              <PrimaryButton
                label={t('home.resubmitButton')}
                onPress={() => router.push({ pathname: '/register/documents', params: { mode: 'resubmit' } })}
              />
            </View>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={s.container}>
      <AppHeader showLogo rightAction={<NotificationBell />} />
      <ScrollView
        contentContainerStyle={{ paddingTop: Spacing.md, paddingBottom: Spacing.xxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.brandGreen]} tintColor={Colors.brandGreen} />}
      >
      <Pressable
        style={[s.onlineCard, dashboard?.is_online ? s.onlineCardActive : s.onlineCardInactive]}
        onPress={handleToggleOnline}
        disabled={togglingOnline}
      >
        <View style={[s.onlineIconWrap, { backgroundColor: dashboard?.is_online ? Colors.inkOnAccent : withOpacity(Colors.textSecondary, 0.12) }]}>
          {togglingOnline ? (
            <ActivityIndicator color={dashboard?.is_online ? Colors.brandGreen : Colors.textSecondary} size="small" />
          ) : (
            <Power size={20} color={dashboard?.is_online ? Colors.brandGreen : Colors.textSecondary} strokeWidth={2.5} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.onlineTitle, dashboard?.is_online && s.onlineTitleActive]}>
            {dashboard?.is_online ? t('home.onlineTitle') : t('home.offlineTitle')}
          </Text>
          <Text style={[s.onlineSubtitle, dashboard?.is_online && s.onlineSubtitleActive]}>
            {dashboard?.is_online ? t('home.onlineSubtitle') : t('home.offlineSubtitle')}
          </Text>
        </View>
      </Pressable>

      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={s.statValue}>{dashboard?.today_job_count ?? 0}</Text>
          <Text style={s.statLabel}>{t('home.todaysJobs')}</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statValue}>₹{dashboard?.today_earnings ?? 0}</Text>
          <Text style={s.statLabel}>{t('home.earnedToday')}</Text>
        </View>
        <View style={s.statCard}>
          <RatingStars rating={dashboard?.rating_avg ?? 0} count={dashboard?.rating_count ?? 0} />
          <Text style={s.statLabel}>{t('home.rating')}</Text>
        </View>
      </View>

      <Pressable style={s.availabilityLink} onPress={() => router.push('/availability')}>
        <CalendarClock size={16} color={Colors.brandGreen} strokeWidth={2} />
        <Text style={s.availabilityLinkText}>{t('home.manageAvailability')}</Text>
      </Pressable>

      <Text style={s.sectionTitle}>{t('home.todaysJobs')}</Text>
      {jobs.length === 0 ? (
        <EmptyState icon={Power} title={t('home.noJobsTitle')} subtitle={t('home.noJobsSubtitle')} />
      ) : (
        <View style={s.jobList}>
          {jobs.map((job) => (
            <JobCard key={job.id} booking={job} onPress={() => router.push(jobHref(job))} />
          ))}
        </View>
      )}
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  gateWrap: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xxl,
    alignItems: 'center',
  },
  gateIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(31,77,58,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  gateTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 20,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: 8,
  },
  gateBody: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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
  gateAction: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  onlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.screenPadding,
    padding: Spacing.md,
    borderRadius: 18,
    marginBottom: Spacing.lg,
  },
  onlineCardActive: {
    backgroundColor: Colors.brandGreen,
  },
  onlineCardInactive: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  onlineIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  onlineTitleActive: {
    color: Colors.inkOnAccent,
  },
  onlineSubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  onlineSubtitleActive: {
    color: withOpacity(Colors.inkOnAccent, 0.85),
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.md,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  statValue: {
    fontFamily: FontFamily.headingBold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  availabilityLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  availabilityLinkText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.brandGreen,
  },
  sectionTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.sm,
  },
  jobList: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.sm,
  },
})
