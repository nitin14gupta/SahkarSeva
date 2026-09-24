import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'
import { HeartOff } from 'lucide-react-native'
import { AppHeader, EmptyState, WorkerCard } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { Colors, Spacing } from '@/constants'
import type { WorkerSummary } from '@/types/catalog'

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<WorkerSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const { favorites } = await apiService.getFavorites()
        if (!cancelled) setFavorites(favorites)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <View style={s.container}>
      <AppHeader title="Favorites" showBack />

      {loading ? (
        <View style={s.center}><ActivityIndicator color={Colors.brandGreen} /></View>
      ) : favorites.length === 0 ? (
        <EmptyState icon={HeartOff} title="No favorites yet" subtitle="Workers you favorite will show up here" />
      ) : (
        <FlashList
          data={favorites}
          keyExtractor={(w) => w.id}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <View style={s.cardWrap}>
              <WorkerCard worker={item} onPress={() => router.push({ pathname: '/worker/[id]', params: { id: item.id } })} />
            </View>
          )}
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.xl,
  },
  cardWrap: {
    marginBottom: Spacing.md,
  },
})
