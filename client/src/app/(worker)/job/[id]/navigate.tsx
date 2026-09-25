import { useCallback, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Map, Camera, Marker } from '@maplibre/maplibre-react-native'
import { MapPin, Navigation } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { AppHeader, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { useCurrentLocation } from '@/hooks/useCurrentLocation'
import { usePillStore } from '@/store/pillStore'
import { Colors, DEFAULT_MAP_CENTER, FontFamily, MAP_STYLE_URL, Spacing } from '@/constants'
import type { WorkerBookingDetail } from '@/types/booking'

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export default function JobNavigateScreen() {
  const { t } = useTranslation('worker')
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const show = usePillStore((s) => s.show)
  const { lat, lng } = useCurrentLocation()

  const [booking, setBooking] = useState<WorkerBookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [arriving, setArriving] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        setLoading(true)
        try {
          const { booking } = await apiService.getWorkerBookingDetail(id)
          if (!cancelled) setBooking(booking)
        } catch {
          if (!cancelled) show(t('jobNavigate.loadError'), 'error')
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => { cancelled = true }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when the route id changes, `show` is a stable zustand setter
    }, [id])
  )

  async function handleArrived() {
    setArriving(true)
    try {
      await apiService.updateBookingStatus(id, 'in_progress')
      router.replace({ pathname: '/job/[id]/in-progress', params: { id } })
    } catch {
      show(t('jobNavigate.statusError'), 'error')
      setArriving(false)
    }
  }

  if (loading || !booking) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator color={Colors.brandGreen} />
      </View>
    )
  }

  const destination = booking.address_lat != null && booking.address_lng != null
    ? { lat: booking.address_lat, lng: booking.address_lng }
    : null
  const current = lat != null && lng != null ? { lat, lng } : null
  const distanceKm = current && destination ? haversineKm(current, destination) : null
  const center = current ?? destination ?? DEFAULT_MAP_CENTER

  return (
    <View style={s.container}>
      <AppHeader title={t('jobNavigate.title')} showBack />
      <View style={s.mapWrap}>
        <Map style={s.map} mapStyle={MAP_STYLE_URL} logo={false} attribution={false}>
          <Camera center={[center.lng, center.lat]} zoom={13} />
          {current && (
            <Marker lngLat={[current.lng, current.lat]} anchor="center">
              <View style={s.liveDot} />
            </Marker>
          )}
          {destination && (
            <Marker lngLat={[destination.lng, destination.lat]}>
              <MapPin size={28} color={Colors.terracotta} fill={Colors.terracotta} strokeWidth={1.5} />
            </Marker>
          )}
        </Map>
      </View>

      <View style={s.infoBar}>
        <Navigation size={18} color={Colors.brandGreen} strokeWidth={2} />
        <Text style={s.infoText}>
          {destination
            ? distanceKm !== null
              ? t('jobNavigate.distanceInfo', { distance: distanceKm.toFixed(1), name: booking.customer_name })
              : t('jobNavigate.headingInfo', { name: booking.customer_name })
            : t('jobNavigate.noDestination')}
        </Text>
      </View>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label={t('jobNavigate.arrivedButton')} onPress={handleArrived} loading={arriving} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapWrap: { flex: 1 },
  map: { flex: 1 },
  liveDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  footer: { paddingHorizontal: Spacing.screenPadding },
})
