import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Star } from 'lucide-react-native'
import { Colors, FontFamily } from '@/constants'

interface RatingStarsProps {
  rating: number
  count?: number
  size?: number
}

export function RatingStars({ rating, count, size = 14 }: RatingStarsProps) {
  return (
    <View style={s.row}>
      <Star size={size} color={Colors.gold} fill={Colors.gold} strokeWidth={0} />
      <Text style={s.text}>{rating.toFixed(1)}</Text>
      {count !== undefined && <Text style={s.count}>({count})</Text>}
    </View>
  )
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  text: { fontFamily: FontFamily.bodySemiBold, fontSize: 13, color: Colors.textPrimary },
  count: { fontFamily: FontFamily.bodyRegular, fontSize: 12, color: Colors.textSecondary },
})
