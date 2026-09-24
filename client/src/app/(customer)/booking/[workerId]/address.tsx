import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { MapPin, Plus } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppHeader, EmptyState, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { useBookingDraftStore } from '@/store/bookingDraftStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { Address } from '@/types/address'

export default function AddressLocationScreen() {
  const { workerId } = useLocalSearchParams<{ workerId: string }>()
  const insets = useSafeAreaInsets()
  const setDraft = useBookingDraftStore((s) => s.setDraft)

  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        setLoading(true)
        try {
          const { addresses } = await apiService.getAddresses()
          if (cancelled) return
          setAddresses(addresses)
          setSelectedId((prev) => prev ?? addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? null)
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => { cancelled = true }
    }, [])
  )

  function handleContinue() {
    if (!selectedId) return
    setDraft({ addressId: selectedId })
    router.push({ pathname: '/booking/[workerId]/notes', params: { workerId } })
  }

  if (loading) {
    return <View style={[s.container, s.center]}><ActivityIndicator color={Colors.brandGreen} /></View>
  }

  return (
    <View style={s.container}>
      <AppHeader title="Service address" showBack />

      <ScrollView contentContainerStyle={s.content}>
        {addresses.length === 0 ? (
          <EmptyState icon={MapPin} title="No saved addresses" subtitle="Add one to continue" />
        ) : (
          addresses.map((addr) => (
            <Pressable
              key={addr.id}
              style={[s.addressCard, selectedId === addr.id && s.addressCardSelected]}
              onPress={() => setSelectedId(addr.id)}
            >
              <MapPin size={18} color={selectedId === addr.id ? Colors.brandGreen : Colors.textSecondary} strokeWidth={2} />
              <View style={{ flex: 1 }}>
                <Text style={s.addressLabel}>{addr.label}</Text>
                <Text style={s.addressLine} numberOfLines={2}>
                  {[addr.line1, addr.line2, addr.city, addr.state].filter(Boolean).join(', ')}
                </Text>
              </View>
            </Pressable>
          ))
        )}

        <Pressable style={s.addNew} onPress={() => router.push('/addresses/form')}>
          <Plus size={16} color={Colors.brandGreen} strokeWidth={2} />
          <Text style={s.addNewText}>Add new address</Text>
        </Pressable>
      </ScrollView>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label="Continue" onPress={handleContinue} disabled={!selectedId} />
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
    gap: Spacing.sm,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  addressCardSelected: {
    borderColor: Colors.brandGreen,
    backgroundColor: 'rgba(31,77,58,0.05)',
  },
  addressLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  addressLine: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  addNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
  },
  addNewText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.brandGreen,
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
})
