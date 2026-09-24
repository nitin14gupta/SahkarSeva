import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import * as Location from 'expo-location'
import { MapPin, Plus, Trash2 } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BackButton, EmptyState, Input, MapPinPicker, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { Address } from '@/types/address'

export default function AddressesScreen() {
  const insets = useSafeAreaInsets()
  const show = usePillStore((s) => s.show)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [line1, setLine1] = useState('')
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number } | null>(null)

  async function handlePinPicked(coords: { lat: number; lng: number }) {
    setPinCoords(coords)
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude: coords.lat, longitude: coords.lng })
      if (place) {
        setLine1([place.name, place.street].filter(Boolean).join(', '))
        setCity(place.city ?? '')
      }
    } catch {
      // reverse geocoding is best-effort — user can still type the address manually
    }
  }

  useEffect(() => {
    if (!showForm || pinCoords) return
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      if (status !== 'granted') return
      Location.getCurrentPositionAsync({}).then((pos) => {
        setPinCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      })
    })
  }, [showForm])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const { addresses } = await apiService.getAddresses()
        if (!cancelled) setAddresses(addresses)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  async function handleAdd() {
    if (!line1.trim()) return
    setSaving(true)
    try {
      const { address } = await apiService.createAddress({
        label: 'Home', line1: line1.trim(), city: city.trim() || undefined,
        lat: pinCoords?.lat, lng: pinCoords?.lng,
        is_default: addresses.length === 0,
      })
      setAddresses((prev) => [address, ...prev])
      setShowForm(false)
      setLine1('')
      setCity('')
      setPinCoords(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id))
    try {
      await apiService.deleteAddress(id)
    } catch {
      show('Could not delete address', 'error')
    }
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.topRow}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Saved addresses</Text>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={Colors.brandGreen} /></View>
      ) : (
        <View style={s.content}>
          {addresses.length === 0 && !showForm ? (
            <EmptyState icon={MapPin} title="No saved addresses" />
          ) : (
            addresses.map((addr) => (
              <View key={addr.id} style={s.addressCard}>
                <MapPin size={18} color={Colors.textSecondary} strokeWidth={2} />
                <View style={{ flex: 1 }}>
                  <Text style={s.addressLabel}>{addr.label}</Text>
                  <Text style={s.addressLine} numberOfLines={2}>{addr.line1}{addr.city ? `, ${addr.city}` : ''}</Text>
                </View>
                <Pressable onPress={() => handleDelete(addr.id)} hitSlop={8}>
                  <Trash2 size={16} color={Colors.destructive} strokeWidth={2} />
                </Pressable>
              </View>
            ))
          )}

          {showForm ? (
            <View style={s.form}>
              <MapPinPicker initialCoords={pinCoords ?? undefined} onPick={handlePinPicked} />
              <Text style={s.mapHint}>Tap the map to drop a pin at the address</Text>
              <View style={{ height: Spacing.sm }} />
              <Input placeholder="House / street / landmark" value={line1} onChangeText={setLine1} />
              <View style={{ height: Spacing.sm }} />
              <Input placeholder="City (optional)" value={city} onChangeText={setCity} />
              <View style={{ height: Spacing.md }} />
              <PrimaryButton label="Save address" onPress={handleAdd} loading={saving} disabled={!line1.trim()} />
            </View>
          ) : (
            <Pressable style={s.addNew} onPress={() => setShowForm(true)}>
              <Plus size={16} color={Colors.brandGreen} strokeWidth={2} />
              <Text style={s.addNewText}>Add new address</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  mapHint: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
})
