import { useEffect, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Clock } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppHeader, Avatar, PrimaryButton, SecondaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { Colors, FontFamily, Spacing } from '@/constants'
import type { BookingDetail } from '@/types/booking'

const STATUS_LABEL: Record<string, string> = {
  requested: 'Waiting for confirmation',
  accepted: 'Worker confirmed',
  en_route: 'Worker is on the way',
  in_progress: 'Service in progress',
  completed: 'Service completed',
  cancelled: 'Cancelled',
}

function formatElapsed(startedAt: string): string {
  const ms = Date.now() - new Date(startedAt).getTime()
  const totalMinutes = Math.max(0, Math.floor(ms / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

export default function ServiceInProgressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const { booking } = await apiService.getBookingDetail(id)
        if (!cancelled) setBooking(booking)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(interval)
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const { booking } = await apiService.getBookingDetail(id)
      setBooking(booking)
    } catch {
      // keep whatever was already showing — the pull gesture retrying silently is fine
    } finally {
      setRefreshing(false)
    }
  }

  if (loading || !booking) {
    return <View style={[s.container, s.center]}><ActivityIndicator color={Colors.brandGreen} /></View>
  }

  return (
    <View style={s.container}>
      <AppHeader title="Service status" showBack />

      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.brandGreen]} tintColor={Colors.brandGreen} />}
      >
        <Avatar uri={booking.worker_photo_url} size={72} />
        <Text style={s.workerName}>{booking.worker_name}</Text>
        <Text style={s.status}>{STATUS_LABEL[booking.status]}</Text>

        <View style={s.timerCard}>
          <Clock size={18} color={Colors.brandGreen} strokeWidth={2} />
          <Text key={now} style={s.timerText}>{formatElapsed(booking.created_at)} since booked</Text>
        </View>
      </ScrollView>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label="Contact Worker" onPress={() => router.push({ pathname: '/chat/[id]', params: { id: booking.id } })} />
        <View style={{ height: Spacing.sm }} />
        <SecondaryButton
          label="Report an Issue"
          onPress={() => router.push({ pathname: '/help', params: { bookingId: booking.id } })}
        />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.screenPadding,
  },
  workerName: {
    fontFamily: FontFamily.headingBold,
    fontSize: 18,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  status: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.brandGreen,
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  timerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 999,
    backgroundColor: 'rgba(31,77,58,0.08)',
  },
  timerText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.brandGreen,
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
})
