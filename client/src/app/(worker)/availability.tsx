import { useCallback, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { AppHeader, WeeklyAvailabilityEditor, type SlotStatus } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Spacing } from '@/constants'
import type { WorkerAvailabilitySlot } from '@/types/worker'

const HOURS = [9, 11, 13, 15, 17]
const DAY_LABELS = ['Today', 'Tomorrow']

function buildDays() {
  const days: { date: string; label: string }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const date = d.toISOString().slice(0, 10)
    const label = DAY_LABELS[i] ?? d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
    days.push({ date, label })
  }
  return days
}

export default function WorkerAvailabilityScreen() {
  const show = usePillStore((s) => s.show)
  const [days] = useState(buildDays)
  const [slots, setSlots] = useState<WorkerAvailabilitySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pendingKey, setPendingKey] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        setLoading(true)
        try {
          const { slots } = await apiService.getWorkerAvailability({
            from_date: days[0].date,
            to_date: days[days.length - 1].date,
          })
          if (!cancelled) setSlots(slots)
        } catch {
          if (!cancelled) show('Could not load your availability', 'error')
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => { cancelled = true }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- `days` is stable state, `show` is a stable zustand setter
    }, [])
  )

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const { slots } = await apiService.getWorkerAvailability({
        from_date: days[0].date,
        to_date: days[days.length - 1].date,
      })
      setSlots(slots)
    } catch {
      // keep whatever was already showing — the pull gesture retrying silently is fine
    } finally {
      setRefreshing(false)
    }
  }

  function findSlot(date: string, hour: number): WorkerAvailabilitySlot | undefined {
    const hh = String(hour).padStart(2, '0')
    return slots.find((s) => s.slot_date === date && s.start_time.slice(0, 2) === hh)
  }

  function getStatus(date: string, hour: number): SlotStatus {
    const slot = findSlot(date, hour)
    if (!slot) return 'closed'
    return slot.is_booked ? 'booked' : 'open'
  }

  async function handleToggle(date: string, hour: number) {
    const key = `${date}-${hour}`
    const existing = findSlot(date, hour)
    setPendingKey(key)
    try {
      if (existing) {
        await apiService.removeAvailabilitySlot(existing.id)
        setSlots((prev) => prev.filter((s) => s.id !== existing.id))
      } else {
        const startTime = `${String(hour).padStart(2, '0')}:00`
        const endTime = `${String(hour + 1).padStart(2, '0')}:00`
        const { slot } = await apiService.addAvailabilitySlot({ slot_date: date, start_time: startTime, end_time: endTime })
        setSlots((prev) => [...prev, slot])
      }
    } catch {
      show('Could not update that slot', 'error')
    } finally {
      setPendingKey(null)
    }
  }

  return (
    <View style={s.container}>
      <AppHeader title="Availability & Schedule" showBack />
      {loading ? (
        <View style={s.center}><ActivityIndicator color={Colors.brandGreen} /></View>
      ) : (
        <ScrollView
          style={s.inner}
          contentContainerStyle={s.innerContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.brandGreen]} tintColor={Colors.brandGreen} />}
        >
          <Text style={s.hint}>Tap a time slot to open or block it off. Booked slots can&apos;t be removed.</Text>
          <WeeklyAvailabilityEditor
            days={days}
            hours={HOURS}
            getStatus={getStatus}
            onToggle={handleToggle}
            pendingKey={pendingKey}
          />
        </ScrollView>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  inner: { flex: 1, paddingHorizontal: Spacing.screenPadding },
  innerContent: { paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  hint: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
})
