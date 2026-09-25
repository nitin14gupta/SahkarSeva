import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated'
import { router, useLocalSearchParams } from 'expo-router'
import { CheckCircle2 } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { Avatar, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { Colors, FontFamily, Spacing } from '@/constants'
import type { BookingDetail } from '@/types/booking'
import type { WorkerDetail } from '@/types/catalog'

const MATCH_DELAY_MS = 2200

export default function EmergencyMatchingScreen() {
  const { t } = useTranslation('customer')
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [worker, setWorker] = useState<WorkerDetail | null>(null)
  const [matched, setMatched] = useState(false)
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null)
  const pulse = useSharedValue(0)

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.ease) }), -1, false)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { booking } = await apiService.getBookingDetail(id)
      if (cancelled) return
      setBooking(booking)
      const { worker } = await apiService.getWorkerDetail(booking.worker_id)
      if (cancelled) return
      setWorker(worker)
      setTimeout(() => {
        if (cancelled) return
        setEtaMinutes(Math.max(3, Math.round(4 + Math.random() * 6)))
        setMatched(true)
      }, MATCH_DELAY_MS)
    })()
    return () => { cancelled = true }
  }, [id])

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 1 - pulse.value,
    transform: [{ scale: 1 + pulse.value * 1.6 }],
  }))

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {!matched ? (
        <View style={s.center}>
          <View style={s.radarWrap}>
            <Animated.View style={[s.ring, ringStyle]} />
            <View style={s.dot} />
          </View>
          <Text style={s.title}>{t('emergencyMatching.findingTitle')}</Text>
          <Text style={s.subtitle}>{t('emergencyMatching.findingSubtitle')}</Text>
        </View>
      ) : (
        <View style={s.center}>
          <CheckCircle2 size={48} color={Colors.success} strokeWidth={1.5} />
          <Text style={s.title}>{t('emergencyMatching.matchedTitle')}</Text>
          {!!worker && (
            <View style={s.workerCard}>
              <Avatar uri={worker.photo_url} size={56} />
              <View style={{ flex: 1 }}>
                <Text style={s.workerName}>{worker.name}</Text>
                <Text style={s.workerCategory}>{booking?.category}</Text>
              </View>
              <Text style={s.eta}>{t('emergencyMatching.etaMinutes', { eta: etaMinutes })}</Text>
            </View>
          )}
          <View style={{ width: '100%', marginTop: Spacing.xl }}>
            <PrimaryButton
              label={t('emergencyMatching.trackLive')}
              onPress={() => router.replace({ pathname: '/tracking/[id]', params: { id } })}
            />
          </View>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },
  radarWrap: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  ring: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(192,91,65,0.3)',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.terracotta,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 20,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
    padding: Spacing.md,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginTop: Spacing.lg,
  },
  workerName: {
    fontFamily: FontFamily.headingBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  workerCategory: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  eta: {
    fontFamily: FontFamily.headingBold,
    fontSize: 16,
    color: Colors.brandGreen,
  },
})
