import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppHeader, Avatar, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { useBookingDraftStore } from '@/store/bookingDraftStore'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { WorkerDetail } from '@/types/catalog'
import type { Address } from '@/types/address'

export default function BookingSummaryScreen() {
  const { workerId } = useLocalSearchParams<{ workerId: string }>()
  const insets = useSafeAreaInsets()
  const draft = useBookingDraftStore()
  const reset = useBookingDraftStore((s) => s.reset)
  const show = usePillStore((s) => s.show)

  const [worker, setWorker] = useState<WorkerDetail | null>(null)
  const [address, setAddress] = useState<Address | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const [{ worker }, { addresses }] = await Promise.all([
          apiService.getWorkerDetail(workerId),
          apiService.getAddresses(),
        ])
        if (cancelled) return
        setWorker(worker)
        setAddress(addresses.find((a) => a.id === draft.addressId) ?? null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [workerId, draft.addressId])

  async function handleConfirm() {
    if (!draft.category || !draft.scheduledDate || !draft.scheduledTime || !draft.addressId) return
    setSubmitting(true)
    try {
      const { booking } = await apiService.createBooking({
        worker_id: workerId,
        category: draft.category,
        address_id: draft.addressId,
        scheduled_date: draft.scheduledDate,
        scheduled_time: draft.scheduledTime,
        notes: draft.notes,
        photo_urls: draft.photos.map((p) => p.remoteUrl),
      })
      reset()
      router.push({ pathname: '/payment/[bookingId]/select', params: { bookingId: booking.id } })
    } catch {
      show('Could not confirm booking. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !worker) {
    return <View style={[s.container, s.center]}><ActivityIndicator color={Colors.brandGreen} /></View>
  }

  return (
    <View style={s.container}>
      <AppHeader title="Confirm booking" showBack />

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.workerRow}>
          <Avatar uri={worker.photo_url} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={s.workerName}>{worker.name}</Text>
            <Text style={s.workerCategory}>{draft.category}</Text>
          </View>
        </View>

        <View style={s.row}>
          <Text style={s.label}>Date & time</Text>
          <Text style={s.value}>{draft.scheduledDate} · {draft.scheduledTime?.slice(0, 5)}</Text>
        </View>

        <View style={s.row}>
          <Text style={s.label}>Address</Text>
          <Text style={s.value} numberOfLines={2}>
            {address ? `${address.line1}${address.city ? `, ${address.city}` : ''}` : 'Not selected'}
          </Text>
        </View>

        <View style={s.row}>
          <Text style={s.label}>Notes</Text>
          <Text style={s.value}>{draft.notes}</Text>
        </View>

        {draft.photos.length > 0 && (
          <View style={s.row}>
            <Text style={s.label}>Photos ({draft.photos.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.photoRow}>
              {draft.photos.map((photo) => (
                <Image key={photo.remoteUrl} source={{ uri: photo.localUri }} style={s.photoThumb} />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={s.divider} />

        <View style={s.row}>
          <Text style={s.label}>Estimated price</Text>
          <Text style={s.price}>
            {worker.price_min !== null ? `₹${worker.price_min}${worker.price_max ? `–₹${worker.price_max}` : ''}` : 'TBD'}
          </Text>
        </View>
      </ScrollView>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton
          label="Confirm Booking"
          onPress={handleConfirm}
          loading={submitting}
          disabled={!draft.category || !draft.scheduledDate || !draft.scheduledTime || !draft.addressId}
        />
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
    marginBottom: Spacing.lg,
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
  row: {
    marginBottom: Spacing.md,
  },
  photoRow: {
    marginTop: 6,
  },
  photoThumb: {
    width: 56,
    height: 56,
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
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.sm,
  },
  price: {
    fontFamily: FontFamily.headingBold,
    fontSize: 18,
    color: Colors.terracotta,
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
})
