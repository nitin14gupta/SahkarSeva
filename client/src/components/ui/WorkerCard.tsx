import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ShieldCheck } from 'lucide-react-native'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import { Avatar } from './Avatar'
import { RatingStars } from './RatingStars'
import type { WorkerSummary } from '@/types/catalog'

interface WorkerCardProps {
  worker: WorkerSummary
  onPress: () => void
}

export function WorkerCard({ worker, onPress }: WorkerCardProps) {
  return (
    <Pressable style={s.card} onPress={onPress}>
      <Avatar uri={worker.photo_url} size={56} />
      <View style={s.info}>
        <View style={s.nameRow}>
          <Text style={s.name} numberOfLines={1}>{worker.name}</Text>
          {worker.is_online && <View style={s.onlineDot} />}
        </View>

        {!!worker.cooperative_name && (
          <View style={s.badgeRow}>
            <ShieldCheck size={12} color={Colors.brandGreen} strokeWidth={2} />
            <Text style={s.badgeText} numberOfLines={1}>Verified by {worker.cooperative_name}</Text>
          </View>
        )}

        <Text style={s.categories} numberOfLines={1}>{worker.categories.join(' · ')}</Text>

        <View style={s.bottomRow}>
          <RatingStars rating={worker.rating_avg} count={worker.rating_count} />
          {worker.price_min !== null && (
            <Text style={s.price}>
              ₹{worker.price_min}{worker.price_max ? `–${worker.price_max}` : ''}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  )
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flexShrink: 1,
    fontFamily: FontFamily.headingBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    flexShrink: 1,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.brandGreen,
  },
  categories: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
})
