import { useCallback, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { Star } from 'lucide-react-native'
import { AppHeader, Avatar, EmptyState, RatingStars } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { WorkerReview } from '@/types/worker'

export default function WorkerReviewsScreen() {
  const show = usePillStore((s) => s.show)
  const [reviews, setReviews] = useState<WorkerReview[]>([])
  const [ratingAvg, setRatingAvg] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        setLoading(true)
        try {
          const [{ reviews }, { worker }] = await Promise.all([
            apiService.getWorkerReviews(),
            apiService.getWorkerMe(),
          ])
          if (cancelled) return
          setReviews(reviews)
          setRatingAvg(worker.rating_avg)
        } catch {
          if (!cancelled) show('Could not load your reviews', 'error')
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => { cancelled = true }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- `show` is a stable zustand setter
    }, [])
  )

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const [{ reviews }, { worker }] = await Promise.all([
        apiService.getWorkerReviews(),
        apiService.getWorkerMe(),
      ])
      setReviews(reviews)
      setRatingAvg(worker.rating_avg)
    } catch {
      // keep whatever was already showing — the pull gesture retrying silently is fine
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <View style={s.container}>
      <AppHeader title="Reviews received" showBack />
      {loading ? (
        <View style={s.center}><ActivityIndicator color={Colors.brandGreen} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={s.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.brandGreen]} tintColor={Colors.brandGreen} />}
        >
          <View style={s.summary}>
            <RatingStars rating={ratingAvg} count={reviews.length} size={20} />
          </View>

          {reviews.length === 0 ? (
            <EmptyState icon={Star} title="No reviews yet" subtitle="Reviews from completed jobs will show up here" />
          ) : (
            reviews.map((review, i) => (
              <View key={`${review.created_at}-${i}`} style={s.card}>
                <View style={s.cardHeader}>
                  <Avatar uri={review.customer_photo_url} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.customerName}>{review.customer_name}</Text>
                    <RatingStars rating={review.rating} size={12} />
                  </View>
                </View>
                {!!review.comment && <Text style={s.comment}>{review.comment}</Text>}
                {!!review.tags?.length && (
                  <View style={s.tagRow}>
                    {review.tags.map((tag) => (
                      <View key={tag} style={s.tag}>
                        <Text style={s.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  summary: { alignItems: 'center', marginBottom: Spacing.lg },
  card: {
    padding: Spacing.md,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  customerName: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  comment: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(31,77,58,0.08)',
  },
  tagText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
    color: Colors.brandGreen,
  },
})
