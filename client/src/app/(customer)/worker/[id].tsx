import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Heart, ShieldCheck, Star } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar, BackButton, CategoryIcon, EmptyState, PrimaryButton, RatingStars } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { WorkerDetail } from '@/types/catalog'

export default function WorkerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const [worker, setWorker] = useState<WorkerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(false)
      try {
        const [{ worker }, { favorites }] = await Promise.all([
          apiService.getWorkerDetail(id),
          apiService.getFavorites(),
        ])
        if (cancelled) return
        setWorker(worker)
        setIsFavorite(favorites.some((f) => f.id === id))
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [id, refreshKey])

  async function toggleFavorite() {
    setIsFavorite((prev) => !prev)
    try {
      if (isFavorite) await apiService.removeFavorite(id)
      else await apiService.addFavorite(id)
    } catch {
      setIsFavorite((prev) => !prev)
    }
  }

  const availableDates = worker
    ? Array.from(new Set(worker.availability.map((slot) => slot.slot_date))).slice(0, 4)
    : []

  if (loading) {
    return <View style={[s.container, s.center]}><ActivityIndicator color={Colors.brandGreen} /></View>
  }

  if (error || !worker) {
    return (
      <View style={[s.container, s.center]}>
        <Text style={s.errorText}>Couldn&apos;t load this profile.</Text>
        <Pressable onPress={() => setRefreshKey((k) => k + 1)}><Text style={s.retry}>Tap to retry</Text></Pressable>
      </View>
    )
  }

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={[s.topRow, { paddingTop: insets.top }]}>
          <BackButton onPress={() => router.back()} />
          <Pressable style={s.favoriteBtn} onPress={toggleFavorite} hitSlop={8}>
            <Heart
              size={20}
              color={isFavorite ? Colors.terracotta : Colors.textSecondary}
              fill={isFavorite ? Colors.terracotta : 'transparent'}
              strokeWidth={2}
            />
          </Pressable>
        </View>

        <View style={s.headerCard}>
          <Avatar uri={worker.photo_url} size={88} />
          <Text style={s.name}>{worker.name}</Text>
          {!!worker.cooperative_name && (
            <View style={s.verifiedBadge}>
              <ShieldCheck size={14} color={Colors.brandGreen} strokeWidth={2} />
              <Text style={s.verifiedText}>Verified by {worker.cooperative_name}</Text>
            </View>
          )}
          <View style={s.ratingRow}>
            <RatingStars rating={worker.rating_avg} count={worker.rating_count} size={16} />
            <Text style={s.dot}>·</Text>
            <Text style={s.experience}>{worker.years_experience} yrs experience</Text>
          </View>
        </View>

        {!!worker.bio && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>About</Text>
            <Text style={s.bio}>{worker.bio}</Text>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Skills</Text>
          <View style={s.skillRow}>
            {worker.categories.map((cat) => (
              <View key={cat} style={s.skillChip}>
                <CategoryIcon name={cat} size={14} />
                <Text style={s.skillText}>{cat}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Pricing</Text>
          <Text style={s.price}>
            {worker.price_min !== null
              ? `₹${worker.price_min}${worker.price_max ? `–₹${worker.price_max}` : ''} per visit`
              : 'Contact for pricing'}
          </Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Availability</Text>
          {availableDates.length === 0 ? (
            <Text style={s.mutedText}>No open slots right now</Text>
          ) : (
            <View style={s.skillRow}>
              {availableDates.map((d) => (
                <View key={d} style={s.dateChip}><Text style={s.dateChipText}>{d}</Text></View>
              ))}
            </View>
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Reviews ({worker.reviews.length})</Text>
          {worker.reviews.length === 0 ? (
            <EmptyState icon={Star} title="No reviews yet" subtitle="Be the first to book and review this worker" />
          ) : (
            worker.reviews.map((review, i) => (
              <View key={i} style={s.reviewCard}>
                <View style={s.reviewHeader}>
                  <Text style={s.reviewName}>{review.customer_name}</Text>
                  <RatingStars rating={review.rating} size={12} />
                </View>
                {!!review.comment && <Text style={s.reviewComment}>{review.comment}</Text>}
                {!!review.tags?.length && (
                  <View style={s.tagRow}>
                    {review.tags.map((tag) => (
                      <View key={tag} style={s.tagChip}><Text style={s.tagText}>{tag}</Text></View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton
          label="Book Now"
          onPress={() => router.push({ pathname: '/booking/[workerId]/date-time', params: { workerId: worker.id } })}
        />
      </View>
    </View>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.sm,
  },
  favoriteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  headerCard: {
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  name: {
    fontFamily: FontFamily.headingBold,
    fontSize: 22,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  verifiedText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.brandGreen,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    color: Colors.textSecondary,
  },
  experience: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  bio: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  mutedText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  skillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  skillText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  dateChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(31,77,58,0.08)',
  },
  dateChipText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    color: Colors.brandGreen,
  },
  price: {
    fontFamily: FontFamily.headingBold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  reviewCard: {
    padding: Spacing.md,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: Spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewName: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  reviewComment: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(212,160,23,0.12)',
  },
  tagText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
    color: '#8A6A0E',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
})
