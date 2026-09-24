import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppHeader, EmptyState, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { useBookingDraftStore } from '@/store/bookingDraftStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { WorkerDetail } from '@/types/catalog'
import { CalendarX } from 'lucide-react-native'

export default function SelectDateTimeScreen() {
  const { workerId } = useLocalSearchParams<{ workerId: string }>()
  const insets = useSafeAreaInsets()
  const setDraft = useBookingDraftStore((s) => s.setDraft)

  const [worker, setWorker] = useState<WorkerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const { worker } = await apiService.getWorkerDetail(workerId)
        if (cancelled) return
        setWorker(worker)
        if (worker.categories.length === 1) setCategory(worker.categories[0])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [workerId])

  const dates = useMemo(
    () => Array.from(new Set((worker?.availability ?? []).map((s) => s.slot_date))),
    [worker]
  )
  const timesForDate = useMemo(
    () => (worker?.availability ?? []).filter((s) => s.slot_date === selectedDate),
    [worker, selectedDate]
  )

  function handleContinue() {
    if (!category || !selectedDate || !selectedTime || !worker) return
    setDraft({ workerId: worker.id, category, scheduledDate: selectedDate, scheduledTime: selectedTime })
    router.push({ pathname: '/booking/[workerId]/address', params: { workerId: worker.id } })
  }

  if (loading || !worker) {
    return <View style={[s.container, s.center]}><ActivityIndicator color={Colors.brandGreen} /></View>
  }

  return (
    <View style={s.container}>
      <AppHeader title="Select date & time" showBack />

      <ScrollView contentContainerStyle={s.content}>
        {worker.categories.length > 1 && (
          <>
            <Text style={s.sectionTitle}>Service</Text>
            <View style={s.chipRow}>
              {worker.categories.map((cat) => (
                <Pressable
                  key={cat}
                  style={[s.chip, category === cat && s.chipSelected]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[s.chipText, category === cat && s.chipTextSelected]}>{cat}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <Text style={s.sectionTitle}>Date</Text>
        {dates.length === 0 ? (
          <EmptyState icon={CalendarX} title="No open slots" subtitle="This worker has no availability right now" />
        ) : (
          <View style={s.chipRow}>
            {dates.map((d) => (
              <Pressable
                key={d}
                style={[s.chip, selectedDate === d && s.chipSelected]}
                onPress={() => { setSelectedDate(d); setSelectedTime(null) }}
              >
                <Text style={[s.chipText, selectedDate === d && s.chipTextSelected]}>{d}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {!!selectedDate && (
          <>
            <Text style={s.sectionTitle}>Time</Text>
            <View style={s.chipRow}>
              {timesForDate.map((slot) => (
                <Pressable
                  key={slot.id}
                  style={[s.chip, selectedTime === slot.start_time && s.chipSelected]}
                  onPress={() => setSelectedTime(slot.start_time)}
                >
                  <Text style={[s.chipText, selectedTime === slot.start_time && s.chipTextSelected]}>
                    {slot.start_time.slice(0, 5)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton
          label="Continue"
          onPress={handleContinue}
          disabled={!category || !selectedDate || !selectedTime}
        />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  chipSelected: {
    borderColor: Colors.brandGreen,
    backgroundColor: Colors.brandGreen,
  },
  chipText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  chipTextSelected: {
    color: Colors.inkOnAccent,
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
})
