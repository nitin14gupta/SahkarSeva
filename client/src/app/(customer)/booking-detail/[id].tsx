import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { MessageCircle, Phone } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppHeader, Avatar, PrimaryButton, SecondaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { BookingDetail } from '@/types/booking'

const STATUS_LABEL: Record<string, string> = {
  requested: 'Requested',
  accepted: 'Accepted',
  en_route: 'On the way',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const ACTIVE_STATUSES = ['requested', 'accepted', 'en_route', 'in_progress']

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading || !booking) {
    return <View style={[s.container, s.center]}><ActivityIndicator color={Colors.brandGreen} /></View>
  }

  const isActive = ACTIVE_STATUSES.includes(booking.status)

  return (
    <View style={s.container}>
      <AppHeader title="Booking details" showBack />

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.workerRow}>
          <Avatar uri={booking.worker_photo_url} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={s.workerName}>{booking.worker_name}</Text>
            <Text style={s.workerCategory}>{booking.category}</Text>
            {!!booking.cooperative_name && <Text style={s.cooperative}>Verified by {booking.cooperative_name}</Text>}
          </View>
          <View style={s.statusBadge}>
            <Text style={s.statusText}>{STATUS_LABEL[booking.status]}</Text>
          </View>
        </View>

        {isActive && (
          <View style={s.actionsRow}>
            <Pressable style={s.actionBtn} onPress={() => router.push({ pathname: '/chat/[id]', params: { id: booking.id } })}>
              <MessageCircle size={18} color={Colors.brandGreen} strokeWidth={2} />
              <Text style={s.actionText}>Chat</Text>
            </Pressable>
            <Pressable style={s.actionBtn} onPress={() => Linking.openURL(`tel:${booking.worker_phone}`)}>
              <Phone size={18} color={Colors.brandGreen} strokeWidth={2} />
              <Text style={s.actionText}>Call</Text>
            </Pressable>
          </View>
        )}

        <View style={s.row}>
          <Text style={s.label}>Date & time</Text>
          <Text style={s.value}>
            {booking.scheduled_date ?? '—'} {booking.scheduled_time?.slice(0, 5) ?? ''}
          </Text>
        </View>

        <View style={s.row}>
          <Text style={s.label}>Address</Text>
          <Text style={s.value}>
            {booking.address_line1 ? `${booking.address_line1}${booking.address_city ? `, ${booking.address_city}` : ''}` : '—'}
          </Text>
        </View>

        {!!booking.notes && (
          <View style={s.row}>
            <Text style={s.label}>Notes</Text>
            <Text style={s.value}>{booking.notes}</Text>
          </View>
        )}

        {booking.photo_urls.length > 0 && (
          <View style={s.row}>
            <Text style={s.label}>Photos ({booking.photo_urls.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.photoRow}>
              {booking.photo_urls.map((url) => (
                <Image key={url} source={{ uri: url }} style={s.photoThumb} />
              ))}
            </ScrollView>
          </View>
        )}

        {booking.status === 'cancelled' && !!booking.cancelled_reason && (
          <View style={s.row}>
            <Text style={s.label}>Cancellation reason</Text>
            <Text style={s.value}>{booking.cancelled_reason}</Text>
          </View>
        )}

        <View style={s.row}>
          <Text style={s.label}>Price</Text>
          <Text style={s.price}>{booking.price_estimate !== null ? `₹${booking.price_estimate}` : 'TBD'}</Text>
        </View>
      </ScrollView>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {isActive ? (
          <SecondaryButton
            label="Cancel booking"
            onPress={() => router.push({ pathname: '/cancel/[id]', params: { id: booking.id } })}
          />
        ) : booking.status === 'completed' ? (
          <PrimaryButton
            label="Book again"
            onPress={() => router.push({ pathname: '/worker/[id]', params: { id: booking.worker_id } })}
          />
        ) : null}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.xl,
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: Spacing.md,
  },
  workerName: {
    fontFamily: FontFamily.headingBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  workerCategory: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  cooperative: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.brandGreen,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(31,77,58,0.1)',
  },
  statusText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    color: Colors.brandGreen,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.brandGreen,
  },
  actionText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.brandGreen,
  },
  row: {
    marginBottom: Spacing.md,
  },
  photoRow: {
    marginTop: 6,
  },
  photoThumb: {
    width: 64,
    height: 64,
    borderRadius: Radius.sm,
    marginRight: Spacing.sm,
  },
  label: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  value: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  price: {
    fontFamily: FontFamily.headingBold,
    fontSize: 16,
    color: Colors.terracotta,
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
})
