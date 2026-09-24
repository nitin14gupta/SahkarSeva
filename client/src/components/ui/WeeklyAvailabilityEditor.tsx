import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Colors, FontFamily, Radius, Spacing, withOpacity } from '@/constants'

export type SlotStatus = 'open' | 'booked' | 'closed'

interface WeeklyAvailabilityEditorProps {
  days: { date: string; label: string }[]
  hours: number[]
  getStatus: (date: string, hour: number) => SlotStatus
  onToggle: (date: string, hour: number) => void
  pendingKey?: string | null
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}${period}`
}

export function WeeklyAvailabilityEditor({ days, hours, getStatus, onToggle, pendingKey }: WeeklyAvailabilityEditorProps) {
  return (
    <View style={s.wrap}>
      {days.map((day) => (
        <View key={day.date} style={s.dayRow}>
          <Text style={s.dayLabel}>{day.label}</Text>
          <View style={s.hourRow}>
            {hours.map((hour) => {
              const status = getStatus(day.date, hour)
              const key = `${day.date}-${hour}`
              return (
                <Pressable
                  key={hour}
                  style={[s.chip, status === 'open' && s.chipOpen, status === 'booked' && s.chipBooked]}
                  onPress={() => onToggle(day.date, hour)}
                  disabled={status === 'booked' || pendingKey === key}
                >
                  <Text style={[s.chipText, status === 'open' && s.chipTextOpen, status === 'booked' && s.chipTextBooked]}>
                    {formatHour(hour)}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { gap: Spacing.md },
  dayRow: { gap: Spacing.sm },
  dayLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  hourRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  chipOpen: {
    borderColor: Colors.brandGreen,
    backgroundColor: Colors.brandGreen,
  },
  chipBooked: {
    borderColor: withOpacity(Colors.gold, 0.4),
    backgroundColor: withOpacity(Colors.gold, 0.15),
  },
  chipText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  chipTextOpen: {
    color: Colors.inkOnAccent,
  },
  chipTextBooked: {
    color: Colors.gold,
  },
})
