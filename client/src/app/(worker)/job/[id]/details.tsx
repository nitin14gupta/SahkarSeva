import { useCallback, useState } from 'react'
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MapPin, Phone } from 'lucide-react-native'
import { AppHeader, Avatar, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { WorkerBookingDetail } from '@/types/booking'

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const show = usePillStore((s) => s.show)

  const [booking, setBooking] = useState<WorkerBookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        setLoading(true)
        try {
          const { booking } = await apiService.getWorkerBookingDetail(id)
          if (!cancelled) setBooking(booking)
        } catch {
          if (!cancelled) show('Could not load this job', 'error')
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => { cancelled = true }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when the route id changes, `show` is a stable zustand setter
    }, [id])
  )

  async function handleStartNavigation() {
    setStarting(true)
    try {
      await apiService.updateBookingStatus(id, 'en_route')
      router.replace({ pathname: '/job/[id]/navigate', params: { id } })
    } catch {
      show('Could not start navigation', 'error')
      setStarting(false)
    }
  }

  if (loading || !booking) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator color={Colors.brandGreen} />
      </View>
    )
  }

  return (
    <View style={s.container}>
      <AppHeader title="Job details" showBack />
      <ScrollView style={s.inner} contentContainerStyle={s.innerContent}>
        <View style={s.customerRow}>
          <Avatar uri={booking.customer_photo_url} size={52} />
          <View style={{ flex: 1 }}>
            <Text style={s.customerName}>{booking.customer_name}</Text>
            <Text style={s.category}>{booking.category}</Text>
          </View>
          {!!booking.customer_phone && (
            <Pressable style={s.callBtn} onPress={() => Linking.openURL(`tel:${booking.customer_phone}`)}>
              <Phone size={18} color={Colors.brandGreen} strokeWidth={2} />
            </Pressable>
          )}
        </View>

        <View style={s.section}>
          <View style={s.sectionRow}>
            <MapPin size={16} color={Colors.textSecondary} strokeWidth={2} />
            <Text style={s.sectionText}>
              {[booking.address_line1, booking.address_city].filter(Boolean).join(', ') || 'No address on file'}
            </Text>
          </View>
          {!!booking.scheduled_date && (
            <Text style={s.sectionSubtext}>
              {booking.scheduled_date} · {booking.scheduled_time?.slice(0, 5)}
            </Text>
          )}
        </View>

        {!!booking.notes && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Notes from customer</Text>
            <Text style={s.sectionText}>{booking.notes}</Text>
          </View>
        )}

        {!!booking.photo_url && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Reference photo</Text>
            <Image source={{ uri: booking.photo_url }} style={s.photo} />
          </View>
        )}

        {booking.price_estimate !== null && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Price estimate</Text>
            <Text style={s.price}>₹{booking.price_estimate}</Text>
          </View>
        )}
      </ScrollView>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label="Start Navigation" onPress={handleStartNavigation} loading={starting} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  inner: { flex: 1, paddingHorizontal: Spacing.screenPadding },
  innerContent: { paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  customerName: {
    fontFamily: FontFamily.headingBold,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  category: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(31,77,58,0.08)',
  },
  section: {
    padding: Spacing.md,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: Spacing.sm,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  sectionText: {
    flex: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  sectionSubtext: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    marginLeft: 24,
  },
  photo: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  price: {
    fontFamily: FontFamily.headingBold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  footer: { paddingHorizontal: Spacing.screenPadding },
})
