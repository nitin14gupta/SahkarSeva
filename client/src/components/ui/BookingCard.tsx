import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import { Avatar } from './Avatar'
import type { BookingSummary } from '@/types/booking'

const STATUS_LABEL: Record<string, string> = {
  requested: 'Requested',
  accepted: 'Accepted',
  en_route: 'On the way',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STATUS_COLOR: Record<string, string> = {
  requested: Colors.warning,
  accepted: Colors.brandGreen,
  en_route: Colors.brandGreen,
  in_progress: Colors.brandGreen,
  completed: Colors.textSecondary,
  cancelled: Colors.destructive,
}

interface BookingCardProps {
  booking: BookingSummary
  onPress: () => void
  compact?: boolean
}

export function BookingCard({ booking, onPress, compact }: BookingCardProps) {
  if (compact) {
    return (
      <Pressable style={s.compactCard} onPress={onPress}>
        <Avatar uri={booking.worker_photo_url} size={44} />
        <Text style={s.compactName} numberOfLines={1}>{booking.worker_name}</Text>
        <Text style={s.compactCategory} numberOfLines={1}>{booking.category}</Text>
      </Pressable>
    )
  }

  return (
    <Pressable style={s.card} onPress={onPress}>
      <Avatar uri={booking.worker_photo_url} size={48} />
      <View style={s.info}>
        <Text style={s.name} numberOfLines={1}>{booking.worker_name}</Text>
        <Text style={s.category}>{booking.category}</Text>
        {!!booking.scheduled_date && (
          <Text style={s.date}>{booking.scheduled_date} {booking.scheduled_time?.slice(0, 5)}</Text>
        )}
      </View>
      <Text style={[s.status, { color: STATUS_COLOR[booking.status] }]}>
        {STATUS_LABEL[booking.status]}
      </Text>
    </Pressable>
  )
}

const s = StyleSheet.create({
  compactCard: {
    width: 88,
    alignItems: 'center',
    gap: 4,
  },
  compactName: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  compactCategory: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: FontFamily.headingBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  category: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  date: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  status: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
  },
})
