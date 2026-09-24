import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Siren } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BookingCard, CategoryTile, LogoMark, SearchBar } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { Colors, FontFamily, Spacing } from '@/constants'
import type { Category } from '@/types/catalog'
import type { BookingSummary } from '@/types/booking'

export default function CustomerHomeScreen() {
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [recentBookings, setRecentBookings] = useState<BookingSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(false)
      try {
        const [{ categories }, { bookings }] = await Promise.all([
          apiService.getCategories(),
          apiService.getBookings(),
        ])
        if (cancelled) return
        setCategories(categories)
        setRecentBookings(bookings.slice(0, 5))
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [refreshKey])

  function handleSearchSubmit() {
    if (!query.trim()) return
    router.push({ pathname: '/search', params: { q: query.trim() } })
  }

  if (loading) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator color={Colors.brandGreen} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={[s.container, s.center]}>
        <Text style={s.errorText}>Couldn&apos;t load the home screen.</Text>
        <Pressable onPress={() => setRefreshKey((k) => k + 1)}><Text style={s.retry}>Tap to retry</Text></Pressable>
      </View>
    )
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingTop: insets.top + Spacing.md, paddingBottom: Spacing.xxl }}>
      <View style={s.header}>
        <LogoMark size={28} />
        <Text style={s.headerTitle}>SahkarSeva</Text>
      </View>

      <View style={s.searchWrap}>
        <SearchBar value={query} onChangeText={setQuery} onSubmit={handleSearchSubmit} />
      </View>

      <Pressable
        style={s.emergencyBanner}
        onPress={() => router.push('/emergency')}
      >
        <Siren size={22} color={Colors.inkOnAccent} strokeWidth={2} />
        <View style={s.emergencyText}>
          <Text style={s.emergencyTitle}>Emergency Service</Text>
          <Text style={s.emergencySubtitle}>Get a verified worker at your door, fast</Text>
        </View>
      </Pressable>

      <Text style={s.sectionTitle}>What do you need?</Text>
      <FlatList
        data={categories}
        keyExtractor={(c) => c.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.categoryList}
        renderItem={({ item }) => (
          <CategoryTile
            name={item.name}
            icon={item.icon}
            onPress={() => router.push({ pathname: '/category/[name]', params: { name: item.name } })}
          />
        )}
      />

      {recentBookings.length > 0 && (
        <>
          <Text style={s.sectionTitle}>Recently booked</Text>
          <FlatList
            data={recentBookings}
            keyExtractor={(b) => b.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.recentList}
            renderItem={({ item }) => (
              <BookingCard
                booking={item}
                compact
                onPress={() => router.push({ pathname: '/worker/[id]', params: { id: item.worker_id } })}
              />
            )}
          />
        </>
      )}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 18,
    color: Colors.brandGreen,
  },
  searchWrap: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.screenPadding,
    padding: Spacing.md,
    borderRadius: 16,
    backgroundColor: Colors.terracotta,
    marginBottom: Spacing.lg,
  },
  emergencyText: {
    flex: 1,
  },
  emergencyTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 15,
    color: Colors.inkOnAccent,
  },
  emergencySubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.inkOnAccent,
    opacity: 0.9,
  },
  sectionTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.sm,
  },
  categoryList: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  recentList: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.md,
  },
})
