import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import BottomSheet, { BottomSheetView } from '@expo/ui/community/bottom-sheet'
import { router, useLocalSearchParams } from 'expo-router'
import * as Location from 'expo-location'
import { SlidersHorizontal, UserX } from 'lucide-react-native'
import { AppHeader, EmptyState, HeaderIconBtn, PrimaryButton, SecondaryButton, WorkerCard } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { WorkerSearchParams, WorkerSummary } from '@/types/catalog'

const MIN_RATING_OPTIONS = [
  { label: 'Any', value: undefined },
  { label: '4.0+', value: 4 },
  { label: '4.5+', value: 4.5 },
]
const MAX_PRICE_OPTIONS = [
  { label: 'Any', value: undefined },
  { label: 'Under ₹300', value: 300 },
  { label: 'Under ₹500', value: 500 },
]

export default function CategoryBrowseScreen() {
  const { name } = useLocalSearchParams<{ name: string }>()
  const sheetRef = useRef<BottomSheet>(null)

  const [workers, setWorkers] = useState<WorkerSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const [minRating, setMinRating] = useState<number | undefined>(undefined)
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined)
  const [availableToday, setAvailableToday] = useState(false)

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync()
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({})
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      }
    })()
  }, [])

  const load = useCallback(async (params: WorkerSearchParams) => {
    setLoading(true)
    setError(false)
    try {
      const { workers } = await apiService.getWorkers({ category: name, ...params })
      setWorkers(workers)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [name])

  // Mount-only fetch, inlined (not calling `load`) — filter state is still at
  // its defaults at this point, so `{ category: name }` alone is equivalent.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(false)
      try {
        const { workers } = await apiService.getWorkers({ category: name })
        if (cancelled) return
        setWorkers(workers)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [name])

  function applyFilters() {
    load({ min_rating: minRating, max_price: maxPrice, available_today: availableToday, ...coords })
    sheetRef.current?.close()
  }

  function resetFilters() {
    setMinRating(undefined)
    setMaxPrice(undefined)
    setAvailableToday(false)
  }

  return (
    <View style={s.container}>
      <AppHeader
        title={name}
        showBack
        rightAction={(
          <HeaderIconBtn onPress={() => sheetRef.current?.snapToIndex(0)}>
            <SlidersHorizontal size={18} color={Colors.brandGreen} strokeWidth={2} />
          </HeaderIconBtn>
        )}
      />

      {loading ? (
        <View style={s.center}><ActivityIndicator color={Colors.brandGreen} /></View>
      ) : error ? (
        <View style={s.center}>
          <Text style={s.errorText}>Couldn&apos;t load workers.</Text>
          <Pressable onPress={() => load({ min_rating: minRating, max_price: maxPrice, available_today: availableToday, ...coords })}>
            <Text style={s.retry}>Tap to retry</Text>
          </Pressable>
        </View>
      ) : workers.length === 0 ? (
        <EmptyState icon={UserX} title="No workers found" subtitle="Try adjusting your filters" />
      ) : (
        <FlashList
          data={workers}
          keyExtractor={(w) => w.id}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <View style={s.cardWrap}>
              <WorkerCard worker={item} onPress={() => router.push({ pathname: '/worker/[id]', params: { id: item.id } })} />
            </View>
          )}
        />
      )}

      <BottomSheet ref={sheetRef} index={-1} enablePanDownToClose snapPoints={['55%']}>
        <BottomSheetView style={s.sheet}>
          <Text style={s.sheetTitle}>Filters</Text>

          <Text style={s.filterLabel}>Minimum rating</Text>
          <View style={s.chipRow}>
            {MIN_RATING_OPTIONS.map((opt) => (
              <Pressable
                key={opt.label}
                style={[s.chip, minRating === opt.value && s.chipSelected]}
                onPress={() => setMinRating(opt.value)}
              >
                <Text style={[s.chipText, minRating === opt.value && s.chipTextSelected]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={s.filterLabel}>Price</Text>
          <View style={s.chipRow}>
            {MAX_PRICE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.label}
                style={[s.chip, maxPrice === opt.value && s.chipSelected]}
                onPress={() => setMaxPrice(opt.value)}
              >
                <Text style={[s.chipText, maxPrice === opt.value && s.chipTextSelected]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={s.toggleRow} onPress={() => setAvailableToday((v) => !v)}>
            <Text style={s.filterLabel}>Available today</Text>
            <View style={[s.toggle, availableToday && s.toggleOn]}>
              <View style={[s.toggleKnob, availableToday && s.toggleKnobOn]} />
            </View>
          </Pressable>

          <View style={s.sheetFooter}>
            <View style={{ flex: 1 }}>
              <SecondaryButton label="Reset" onPress={resetFilters} />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton label="Apply" onPress={applyFilters} />
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  retry: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.brandGreen,
  },
  list: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.xl,
  },
  cardWrap: {
    marginBottom: Spacing.md,
  },
  sheet: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  sheetTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  filterLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  chipSelected: {
    borderColor: Colors.brandGreen,
    backgroundColor: Colors.brandGreen,
  },
  chipText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  chipTextSelected: {
    color: Colors.inkOnAccent,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.divider,
    padding: 2,
  },
  toggleOn: {
    backgroundColor: Colors.brandGreen,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white,
  },
  toggleKnobOn: {
    marginLeft: 18,
  },
  sheetFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
})
