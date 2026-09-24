import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as Location from 'expo-location'
import { MapPin, Plus } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BackButton, EmptyState, Input, PrimaryButton } from '@/components/ui'
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
  const [showForm, setShowForm] = useState(false)
  const [line1, setLine1] = useState('')
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const { addresses } = await apiService.getAddresses()
        if (cancelled) return
        setAddresses(addresses)
        const defaultAddr = addresses.find((a) => a.is_default) ?? addresses[0]
        if (defaultAddr) setSelectedId(defaultAddr.id)
        if (addresses.length === 0) setShowForm(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  async function handleSaveAddress() {
    if (!line1.trim()) return
    setSaving(true)
    try {
      let lat: number | undefined
      let lng: number | undefined
      const { status } = await Location.getForegroundPermissionsAsync()
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({})
        lat = pos.coords.latitude
        lng = pos.coords.longitude
      }
      const { address } = await apiService.createAddress({
        label: 'Home',
        line1: line1.trim(),
        city: city.trim() || undefined,
        lat,
        lng,
        is_default: addresses.length === 0,
      })
      setAddresses((prev) => [address, ...prev])
      setSelectedId(address.id)
      setShowForm(false)
      setLine1('')
      setCity('')
    } finally {
      setSaving(false)
    }
  }

  function handleContinue() {
    if (!selectedId) return
    setDraft({ addressId: selectedId })
    router.push({ pathname: '/booking/[workerId]/notes', params: { workerId } })
  }

  if (loading) {
    return <View style={[s.container, s.center]}><ActivityIndicator color={Colors.brandGreen} /></View>
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.topRow}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Service address</Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {addresses.length === 0 && !showForm ? (
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
                  {addr.line1}{addr.city ? `, ${addr.city}` : ''}
                </Text>
              </View>
            </Pressable>
          ))
        )}

        {showForm ? (
          <View style={s.form}>
            <Input placeholder="House / street / landmark" value={line1} onChangeText={setLine1} />
            <View style={{ height: Spacing.sm }} />
            <Input placeholder="City (optional)" value={city} onChangeText={setCity} />
            <View style={{ height: Spacing.md }} />
            <PrimaryButton label="Save address" onPress={handleSaveAddress} loading={saving} disabled={!line1.trim()} />
          </View>
        ) : (
          <Pressable style={s.addNew} onPress={() => setShowForm(true)}>
            <Plus size={16} color={Colors.brandGreen} strokeWidth={2} />
            <Text style={s.addNewText}>Add new address</Text>
          </Pressable>
        )}
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
  form: {
    marginTop: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
})
