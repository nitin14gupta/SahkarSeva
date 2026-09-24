import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Map, Camera, Marker } from '@maplibre/maplibre-react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Check } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar, BackButton, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { Colors, FontFamily, MAP_STYLE_URL, Radius, Spacing } from '@/constants'
import type { BookingDetail } from '@/types/booking'
import type { WorkerDetail } from '@/types/catalog'

const STEPS: { key: string; label: string }[] = [
  { key: 'requested', label: 'Requested' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'en_route', label: 'En Route' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
]

const POLL_MS = 6000

export default function LiveTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [worker, setWorker] = useState<WorkerDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function poll() {
      try {
        const { booking } = await apiService.getBookingDetail(id)
        if (cancelled) return
        setBooking(booking)
        if (!worker) {
          const { worker: w } = await apiService.getWorkerDetail(booking.worker_id)
          if (!cancelled) setWorker(w)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    poll()
    const interval = setInterval(poll, POLL_MS)
    return () => { cancelled = true; clearInterval(interval) }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: poll loop shouldn't reset on `worker` changing
  }, [id])

  if (loading || !booking) {
    return <View style={[s.container, s.center]}><ActivityIndicator color={Colors.brandGreen} /></View>
  }

  const stepIndex = STEPS.findIndex((s) => s.key === booking.status)
  const workerCoords = worker?.lat && worker?.lng ? { lat: worker.lat, lng: worker.lng } : null

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.topRow}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Live tracking</Text>
      </View>

      <View style={s.mapWrap}>
        {workerCoords ? (
          <Map style={s.map} mapStyle={MAP_STYLE_URL}>
            <Camera center={[workerCoords.lng, workerCoords.lat]} zoom={13} />
            <Marker lngLat={[workerCoords.lng, workerCoords.lat]}>
              <View style={s.workerDot} />
            </Marker>
          </Map>
        ) : (
          <View style={[s.map, s.center]}>
            <Text style={s.mutedText}>Worker location unavailable</Text>
          </View>
        )}
      </View>

      <View style={s.stepper}>
        {STEPS.map((step, i) => (
          <View key={step.key} style={s.stepRow}>
            <View style={[s.stepDot, i <= stepIndex && s.stepDotActive]}>
              {i <= stepIndex && <Check size={12} color={Colors.inkOnAccent} strokeWidth={3} />}
            </View>
            <Text style={[s.stepLabel, i <= stepIndex && s.stepLabelActive]}>{step.label}</Text>
          </View>
        ))}
      </View>

      {!!worker && (
        <View style={s.workerCard}>
          <Avatar uri={worker.photo_url} size={44} />
          <View style={{ flex: 1 }}>
            <Text style={s.workerName}>{worker.name}</Text>
            <Text style={s.workerCategory}>{booking.category}</Text>
          </View>
        </View>
      )}

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label="Chat with worker" onPress={() => router.push({ pathname: '/chat/[id]', params: { id: booking.id } })} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
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
  mapWrap: {
    height: 220,
    marginHorizontal: Spacing.screenPadding,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  map: {
    flex: 1,
  },
  mutedText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  workerDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.terracotta,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  stepper: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.divider,
  },
  stepDotActive: {
    backgroundColor: Colors.brandGreen,
  },
  stepLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  stepLabelActive: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.bodySemiBold,
  },
  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.screenPadding,
    padding: Spacing.md,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: Spacing.md,
  },
  workerName: {
    fontFamily: FontFamily.headingBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  workerCategory: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
})
