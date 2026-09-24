import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as Location from 'expo-location'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppHeader, Input, KeyboardAvoidingWrapper, LanguageChip, MapPinPicker, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Spacing } from '@/constants'

const LABELS = ['Home', 'Work', 'Other']

export default function AddressFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const insets = useSafeAreaInsets()
  const show = usePillStore((s) => s.show)

  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [isDefault, setIsDefault] = useState(false)
  const [label, setLabel] = useState('Home')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const { addresses } = await apiService.getAddresses()
        const existing = addresses.find((a) => a.id === id)
        if (cancelled || !existing) return
        setLabel(existing.label)
        setLine1(existing.line1)
        setLine2(existing.line2 ?? '')
        setCity(existing.city ?? '')
        setState(existing.state ?? '')
        setPincode(existing.pincode ?? '')
        setIsDefault(existing.is_default)
        if (existing.lat != null && existing.lng != null) setPinCoords({ lat: existing.lat, lng: existing.lng })
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  async function handlePinPicked(coords: { lat: number; lng: number }) {
    setPinCoords(coords)
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude: coords.lat, longitude: coords.lng })
      if (place) {
        if (!line1.trim()) setLine1([place.name, place.streetNumber].filter(Boolean).join(', '))
        if (!line2.trim()) setLine2(place.street ?? '')
        if (!city.trim()) setCity(place.city ?? '')
        if (!state.trim()) setState(place.region ?? '')
        if (!pincode.trim()) setPincode(place.postalCode ?? '')
      }
    } catch {
      // reverse geocoding is best-effort — fields can still be typed manually
    }
  }

  const isValid = line1.trim().length > 0

  async function handleSave() {
    if (!isValid) return
    setSaving(true)
    const body = {
      label,
      line1: line1.trim(),
      line2: line2.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      pincode: pincode.trim() || undefined,
      lat: pinCoords?.lat,
      lng: pinCoords?.lng,
      is_default: isDefault,
    }
    try {
      if (id) {
        await apiService.updateAddress(id, body)
      } else {
        await apiService.createAddress(body)
      }
      router.back()
    } catch {
      show('Could not save address', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <View style={[s.container, s.center]}><ActivityIndicator color={Colors.brandGreen} /></View>
  }

  return (
    <View style={s.container}>
      <AppHeader title={id ? 'Edit address' : 'Add address'} showBack />
      <KeyboardAvoidingWrapper transparent>
        <View style={s.content}>
          <MapPinPicker initialCoords={pinCoords ?? undefined} onPick={handlePinPicked} />
          <Text style={s.mapHint}>Tap the map to drop a pin — we&apos;ll try to fill in the address below</Text>

          <View style={s.labelRow}>
            {LABELS.map((l) => (
              <LanguageChip key={l} label={l} selected={label === l} onPress={() => setLabel(l)} />
            ))}
          </View>

          <Text style={s.fieldLabel}>House / Flat / Building No.</Text>
          <Input placeholder="e.g. Flat 4B, Shanti Apartments" value={line1} onChangeText={setLine1} style={s.fieldGap} />

          <Text style={s.fieldLabel}>Road, area, landmark (optional)</Text>
          <Input placeholder="e.g. MG Road, Near City Hospital" value={line2} onChangeText={setLine2} style={s.fieldGap} />

          <View style={s.row}>
            <View style={s.rowField}>
              <Text style={s.fieldLabel}>City</Text>
              <Input placeholder="City" value={city} onChangeText={setCity} />
            </View>
            <View style={s.rowField}>
              <Text style={s.fieldLabel}>State</Text>
              <Input placeholder="State" value={state} onChangeText={setState} />
            </View>
          </View>

          <Text style={[s.fieldLabel, s.fieldGapTop]}>Pincode</Text>
          <Input
            placeholder="6-digit pincode"
            value={pincode}
            onChangeText={(v) => setPincode(v.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
          />
        </View>

        <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <PrimaryButton label="Save address" onPress={handleSave} disabled={!isValid} loading={saving} />
        </View>
      </KeyboardAvoidingWrapper>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  mapHint: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  fieldLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  fieldGap: { marginBottom: Spacing.sm },
  fieldGapTop: { marginTop: Spacing.sm },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  rowField: { flex: 1 },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
})
