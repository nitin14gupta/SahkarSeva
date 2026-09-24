import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { router, useLocalSearchParams } from 'expo-router'
import { SearchX } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BackButton, EmptyState, SearchBar, WorkerCard } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { Colors, Spacing } from '@/constants'
import type { WorkerSummary } from '@/types/catalog'

export default function SearchResultsScreen() {
  const { q: initialQuery } = useLocalSearchParams<{ q?: string }>()
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState(initialQuery ?? '')
  const [results, setResults] = useState<WorkerSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const runSearch = useCallback(async (text: string) => {
    if (!text.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    try {
      const { workers } = await apiService.getWorkers({ q: text.trim() })
      setResults(workers)
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }, [])

  // Mount-only search using the initial query param, inlined (not calling
  // `runSearch`) so this effect body is self-contained.
  useEffect(() => {
    const text = initialQuery ?? ''
    if (!text.trim()) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const { workers } = await apiService.getWorkers({ q: text.trim() })
        if (cancelled) return
        setResults(workers)
      } finally {
        if (!cancelled) {
          setLoading(false)
          setSearched(true)
        }
      }
    })()
    return () => { cancelled = true }
  }, [initialQuery])

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.topRow}>
        <BackButton onPress={() => router.back()} />
        <View style={s.searchWrap}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onSubmit={() => runSearch(query)}
            autoFocus={!initialQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={Colors.brandGreen} />
        </View>
      ) : results.length === 0 && searched ? (
        <EmptyState
          icon={SearchX}
          title="No matches found"
          subtitle="Try a different service, skill, or worker name"
        />
      ) : (
        <FlashList
          data={results}
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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.md,
  },
  searchWrap: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.xl,
  },
  cardWrap: {
    marginBottom: Spacing.md,
  },
})
