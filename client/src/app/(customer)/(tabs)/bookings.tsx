import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'
import { CalendarX } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { BookingCard, EmptyState } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { Colors, FontFamily, Spacing } from '@/constants'
import type { BookingGroup, BookingSummary } from '@/types/booking'

const TABS: { key: BookingGroup }[] = [
  { key: 'upcoming' },
  { key: 'past' },
  { key: 'cancelled' },
]

export default function BookingHistoryScreen() {
  const { t } = useTranslation('customer')
  const tabLabels: Record<BookingGroup, string> = {
    upcoming: t('bookingsList.tabUpcoming'),
    past: t('bookingsList.tabPast'),
    cancelled: t('bookingsList.tabCancelled'),
  }
  const insets = useSafeAreaInsets()
  const [tab, setTab] = useState<BookingGroup>('upcoming')
  const [bookings, setBookings] = useState<BookingSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(false)
      try {
        const { bookings } = await apiService.getBookings({ group: tab })
        if (cancelled) return
        setBookings(bookings)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [tab])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const { bookings } = await apiService.getBookings({ group: tab })
      setBookings(bookings)
    } catch {
      // keep whatever was already showing — the pull gesture retrying silently is fine
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <Text style={s.title}>{t('bookingsList.title')}</Text>

      <View style={s.tabRow}>
        {TABS.map((tabItem) => (
          <Pressable key={tabItem.key} style={[s.tab, tab === tabItem.key && s.tabActive]} onPress={() => setTab(tabItem.key)}>
            <Text style={[s.tabText, tab === tabItem.key && s.tabTextActive]}>{tabLabels[tabItem.key]}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={Colors.brandGreen} /></View>
      ) : error ? (
        <View style={s.center}><Text style={s.errorText}>{t('bookingsList.loadError')}</Text></View>
      ) : bookings.length === 0 ? (
        <EmptyState icon={CalendarX} title={t('bookingsList.emptyTitle', { tab: tabLabels[tab].toLowerCase() })} subtitle={t('bookingsList.emptySubtitle')} />
      ) : (
        <FlashList
          data={bookings}
          keyExtractor={(b) => b.id}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.brandGreen]} tintColor={Colors.brandGreen} />}
          renderItem={({ item }) => (
            <View style={s.cardWrap}>
              <BookingCard booking={item} onPress={() => router.push({ pathname: '/booking-detail/[id]', params: { id: item.id } })} />
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
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 22,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  tabActive: {
    borderColor: Colors.brandGreen,
    backgroundColor: Colors.brandGreen,
  },
  tabText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  tabTextActive: {
    color: Colors.inkOnAccent,
  },
  list: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.xl,
  },
  cardWrap: {
    marginBottom: Spacing.md,
  },
})
