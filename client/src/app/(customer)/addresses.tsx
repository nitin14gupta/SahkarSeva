import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import * as Location from 'expo-location'
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react-native'
import { AppHeader, EmptyState, Input, MapPinPicker, PrimaryButton, SecondaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { Address } from '@/types/address'

const LABELS = ['Home', 'Work', 'Other']

export default function AddressesScreen() {
  const show = usePillStore((s) => s.show)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [label, setLabel] = useState('Home')
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

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setLabel('Home')
    setLine1('')
    setCity('')
    setPinCoords(null)
  }

  function startAdd() {
    resetForm()
    setShowForm(true)
  }

  function startEdit(addr: Address) {
    setEditingId(addr.id)
    setLabel(addr.label)
    setLine1(addr.line1)
    setCity(addr.city ?? '')
    setPinCoords(addr.lat != null && addr.lng != null ? { lat: addr.lat, lng: addr.lng } : null)
    setShowForm(true)
  }

  async function handleSave() {
    if (!line1.trim()) return
    setSaving(true)
    try {
      const body = {
        label,
        line1: line1.trim(),
        city: city.trim() || undefined,
        lat: pinCoords?.lat,
        lng: pinCoords?.lng,
        is_default: editingId
          ? addresses.find((a) => a.id === editingId)?.is_default ?? false
          : addresses.length === 0,
      }

      if (editingId) {
        const { address } = await apiService.updateAddress(editingId, body)
        setAddresses((prev) => prev.map((a) => (a.id === editingId ? address : a)))
      } else {
        const { address } = await apiService.createAddress(body)
        setAddresses((prev) => [address, ...prev])
      }
      resetForm()
    } catch {
      show('Could not save address', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const previous = addresses
    setAddresses((prev) => prev.filter((a) => a.id !== id))
    try {
      await apiService.deleteAddress(id)
    } catch (e: any) {
      setAddresses(previous)
      show(e?.response?.data?.detail ?? 'Could not delete address', 'error')
    }
  }

  return (
    <View style={s.container}>
      <AppHeader title="Saved addresses" showBack />

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
                <Pressable onPress={() => startEdit(addr)} hitSlop={8} style={{ marginRight: Spacing.md }}>
                  <Pencil size={16} color={Colors.textSecondary} strokeWidth={2} />
                </Pressable>
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
              <View style={{ height: Spacing.md }} />

              <View style={s.labelRow}>
                {LABELS.map((l) => (
                  <Pressable key={l} style={[s.labelChip, label === l && s.labelChipSelected]} onPress={() => setLabel(l)}>
                    <Text style={[s.labelChipText, label === l && s.labelChipTextSelected]}>{l}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={{ height: Spacing.sm }} />

              <Input placeholder="House / street / landmark" value={line1} onChangeText={setLine1} />
              <View style={{ height: Spacing.sm }} />
              <Input placeholder="City (optional)" value={city} onChangeText={setCity} />
              <View style={{ height: Spacing.md }} />
              <PrimaryButton
                label={editingId ? 'Save changes' : 'Save address'}
                onPress={handleSave}
                loading={saving}
                disabled={!line1.trim()}
              />
              <View style={{ height: Spacing.sm }} />
              <SecondaryButton label="Cancel" onPress={resetForm} />
            </View>
          ) : (
            <Pressable style={s.addNew} onPress={startAdd}>
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
  labelRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  labelChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  labelChipSelected: {
    borderColor: Colors.brandGreen,
    backgroundColor: Colors.brandGreen,
  },
  labelChipText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  labelChipTextSelected: {
    color: Colors.inkOnAccent,
  },
})
