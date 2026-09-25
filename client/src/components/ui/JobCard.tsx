import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import { Avatar } from './Avatar'
import { STATUS_COLOR, STATUS_LABEL_KEY } from './BookingCard'
import type { WorkerBookingSummary } from '@/types/booking'

interface JobCardProps {
  booking: WorkerBookingSummary
  onPress: () => void
}

export function JobCard({ booking, onPress }: JobCardProps) {
  const { t } = useTranslation('common')
  return (
    <Pressable style={s.card} onPress={onPress}>
      <Avatar uri={booking.customer_photo_url} size={48} />
      <View style={s.info}>
        <Text style={s.name} numberOfLines={1}>{booking.customer_name}</Text>
        <Text style={s.category}>{booking.category}</Text>
        {!!booking.scheduled_date && (
          <Text style={s.date}>{booking.scheduled_date} {booking.scheduled_time?.slice(0, 5)}</Text>
        )}
      </View>
      <View style={s.trailing}>
        {booking.is_emergency && <Text style={s.emergency}>{t('booking.emergency')}</Text>}
        <Text style={[s.status, { color: STATUS_COLOR[booking.status] }]}>
          {t(STATUS_LABEL_KEY[booking.status])}
        </Text>
        {booking.price_estimate !== null && <Text style={s.price}>₹{booking.price_estimate}</Text>}
      </View>
    </Pressable>
  )
}

const s = StyleSheet.create({
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
  trailing: {
    alignItems: 'flex-end',
    gap: 2,
  },
  emergency: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.terracotta,
    textTransform: 'uppercase',
  },
  status: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
  },
  price: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.textSecondary,
  },
})
