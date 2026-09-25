import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MapPin, Siren } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { AppHeader, Avatar, CountdownRing, PrimaryButton, SecondaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { useCountdown } from '@/hooks/useCountdown'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { WorkerBookingDetail } from '@/types/booking'

const EMERGENCY_COUNTDOWN_SECONDS = 30

export default function JobRequestScreen() {
  const { t } = useTranslation('worker')
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const show = usePillStore((s) => s.show)

  const [booking, setBooking] = useState<WorkerBookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState<'accept' | 'decline' | null>(null)
  const { seconds, isExpired } = useCountdown(EMERGENCY_COUNTDOWN_SECONDS)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        setLoading(true)
        try {
          const { booking } = await apiService.getWorkerBookingDetail(id)
          if (!cancelled) setBooking(booking)
        } catch {
          if (!cancelled) show(t('jobRequest.loadError'), 'error')
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => { cancelled = true }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when the route id changes, `show` is a stable zustand setter
    }, [id])
  )

  const isEmergency = booking?.is_emergency && booking.status === 'requested'

  async function handleAccept() {
    setResponding('accept')
    try {
      await apiService.acceptBooking(id)
      router.replace({ pathname: '/job/[id]/details', params: { id } })
    } catch {
      show(t('jobRequest.acceptError'), 'error')
      setResponding(null)
    }
  }

  async function handleDecline(reason = t('jobRequest.declineReasonDefault')) {
    setResponding('decline')
    try {
      await apiService.declineBooking(id, reason)
      router.back()
    } catch {
      show(t('jobRequest.declineError'), 'error')
      setResponding(null)
    }
  }

  useEffect(() => {
    if (!isEmergency || !isExpired || responding) return
    let cancelled = false
    ;(async () => {
      setResponding('decline')
      try {
        await apiService.declineBooking(id, t('jobRequest.emergencyTimeoutReason'))
        if (!cancelled) router.back()
      } catch {
        if (!cancelled) {
          show(t('jobRequest.declineError'), 'error')
          setResponding(null)
        }
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires once when the countdown hits zero; `responding` is read, not a trigger
  }, [isEmergency, isExpired])

  if (loading || !booking) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator color={Colors.brandGreen} />
      </View>
    )
  }

  return (
    <View style={s.container}>
      <AppHeader title={t('jobRequest.title')} showBack />
      <View style={s.inner}>
        {isEmergency && (
          <View style={s.emergencyBanner}>
            <Siren size={16} color={Colors.inkOnAccent} strokeWidth={2} />
            <Text style={s.emergencyText}>{t('jobRequest.emergencyBadge')}</Text>
            <CountdownRing progress={seconds / EMERGENCY_COUNTDOWN_SECONDS} seconds={seconds} size={40} strokeWidth={3} />
          </View>
        )}

        <View style={s.card}>
          <Avatar uri={booking.customer_photo_url} size={56} />
          <Text style={s.customerName}>{booking.customer_name}</Text>
          <Text style={s.category}>{booking.category}</Text>

          <View style={s.row}>
            <MapPin size={16} color={Colors.textSecondary} strokeWidth={2} />
            <Text style={s.rowText}>
              {booking.address_city ?? t('jobRequest.locationHidden')}
            </Text>
          </View>

          {!!booking.scheduled_date && (
            <View style={s.row}>
              <Text style={s.rowText}>
                {booking.scheduled_date} · {booking.scheduled_time?.slice(0, 5)}
              </Text>
            </View>
          )}

          {booking.price_estimate !== null && (
            <Text style={s.price}>₹{booking.price_estimate}</Text>
          )}
        </View>
      </View>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={s.actionsRow}>
          <View style={{ flex: 1 }}>
            <SecondaryButton label={t('jobRequest.declineButton')} onPress={handleDecline} loading={responding === 'decline'} disabled={!!responding} />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton label={t('jobRequest.acceptButton')} onPress={handleAccept} loading={responding === 'accept'} disabled={!!responding} />
          </View>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  inner: { flex: 1, paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 16,
    backgroundColor: Colors.terracotta,
    marginBottom: Spacing.lg,
  },
  emergencyText: {
    flex: 1,
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.inkOnAccent,
  },
  card: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: 4,
  },
  customerName: {
    fontFamily: FontFamily.headingBold,
    fontSize: 18,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  category: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  rowText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  price: {
    fontFamily: FontFamily.headingBold,
    fontSize: 20,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  footer: { paddingHorizontal: Spacing.screenPadding },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
})
