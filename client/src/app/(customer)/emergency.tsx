import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import * as Location from 'expo-location'
import { ChevronLeft, Siren } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppHeader, CategoryIcon, HeaderIconBtn, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { Category } from '@/types/catalog'

export default function EmergencyBookingEntryScreen() {
  const insets = useSafeAreaInsets()
  const show = usePillStore((s) => s.show)
  const [categories, setCategories] = useState<Category[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    let cancelled = false
    apiService.getCategories().then(({ categories }) => { if (!cancelled) setCategories(categories) })
    return () => { cancelled = true }
  }, [])

  async function handleRequest() {
    if (!selected) return
    setRequesting(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        show('Location access is needed for emergency requests', 'error')
        return
      }
      const pos = await Location.getCurrentPositionAsync({})
      const { booking } = await apiService.createEmergencyBooking({
        category: selected,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      })
      router.replace({ pathname: '/emergency-matching/[id]', params: { id: booking.id } })
    } catch {
      show('No workers available nearby right now', 'error')
    } finally {
      setRequesting(false)
    }
  }

  return (
    <View style={s.container}>
      <AppHeader
        transparent
        leftAction={(
          <HeaderIconBtn onPress={() => router.back()}>
            <ChevronLeft size={22} color={Colors.inkOnAccent} strokeWidth={2} />
          </HeaderIconBtn>
        )}
      />

      <View style={s.content}>
        <Siren size={40} color={Colors.inkOnAccent} strokeWidth={1.5} />
        <Text style={s.title}>Emergency Service</Text>
        <Text style={s.subtitle}>Get the nearest verified worker to your door, fast</Text>

        <View style={s.grid}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              style={[s.tile, selected === cat.name && s.tileSelected]}
              onPress={() => setSelected(cat.name)}
            >
              <CategoryIcon name={cat.icon} size={22} color={Colors.inkOnAccent} />
              <Text style={s.tileLabel}>{cat.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {requesting ? (
          <ActivityIndicator color={Colors.inkOnAccent} />
        ) : (
          <PrimaryButton label="Request Now" onPress={handleRequest} disabled={!selected} />
        )}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.terracotta },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 24,
    color: Colors.inkOnAccent,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.inkOnAccent,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  tile: {
    width: 96,
    alignItems: 'center',
    gap: 6,
    padding: Spacing.sm,
    borderRadius: Radius.card,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tileSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: Colors.inkOnAccent,
  },
  tileLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
    color: Colors.inkOnAccent,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    alignItems: 'center',
  },
})
