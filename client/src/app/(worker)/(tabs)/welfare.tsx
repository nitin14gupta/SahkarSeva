import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { HeartHandshake } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Input, PrimaryButton, StatusBadge } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { WelfareEnrollment } from '@/types/worker'

export default function WorkerWelfareScreen() {
  const insets = useSafeAreaInsets()
  const show = usePillStore((s) => s.show)

  const [enrollment, setEnrollment] = useState<WelfareEnrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [eshramUan, setEshramUan] = useState('')
  const [schemeName, setSchemeName] = useState('')
  const [enrolling, setEnrolling] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        setLoading(true)
        try {
          const { enrollment } = await apiService.getWelfareEnrollment()
          if (!cancelled) setEnrollment(enrollment)
        } catch {
          if (!cancelled) show('Could not load welfare status', 'error')
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
      const { enrollment } = await apiService.getWelfareEnrollment()
      setEnrollment(enrollment)
    } catch {
      // keep whatever was already showing — the pull gesture retrying silently is fine
    } finally {
      setRefreshing(false)
    }
  }

  async function handleEnroll() {
    setEnrolling(true)
    try {
      const { enrollment } = await apiService.enrollWelfare({
        eshram_uan: eshramUan.trim() || undefined,
        scheme_name: schemeName.trim() || undefined,
      })
      setEnrollment(enrollment)
      show('Enrollment submitted', 'success')
    } catch {
      show('Could not submit enrollment', 'error')
    } finally {
      setEnrolling(false)
    }
  }

  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + Spacing.md, paddingBottom: Spacing.xxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.brandGreen]} tintColor={Colors.brandGreen} />}
      >
        <Text style={s.title}>Welfare & Insurance</Text>

        {loading ? (
          <ActivityIndicator color={Colors.brandGreen} style={s.center} />
        ) : enrollment ? (
          <View style={s.card}>
            <StatusBadge
              tone={enrollment.status === 'active' ? 'success' : 'pending'}
              label={enrollment.status === 'active' ? 'Active' : 'Enrollment pending'}
            />
            <View style={s.field}>
              <Text style={s.fieldLabel}>e-Shram UAN</Text>
              <Text style={s.fieldValue}>{enrollment.eshram_uan ?? '—'}</Text>
            </View>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Scheme</Text>
              <Text style={s.fieldValue}>{enrollment.scheme_name ?? '—'}</Text>
            </View>
          </View>
        ) : (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <HeartHandshake size={20} color={Colors.brandGreen} strokeWidth={2} />
              <Text style={s.cardTitle}>Enroll in welfare & insurance</Text>
            </View>
            <Text style={s.cardSubtitle}>
              Link your e-Shram account to get access to cooperative welfare schemes and insurance cover.
            </Text>
            <Input
              value={eshramUan}
              onChangeText={setEshramUan}
              placeholder="e-Shram UAN (optional)"
              style={s.fieldGap}
            />
            <Input
              value={schemeName}
              onChangeText={setSchemeName}
              placeholder="Preferred scheme (optional)"
              style={s.fieldGap}
            />
            <PrimaryButton label="Enroll" onPress={handleEnroll} loading={enrolling} />
          </View>
        )}

        <Pressable style={s.claimLink} onPress={() => router.push('/welfare/claim')}>
          <Text style={s.claimLinkText}>Submit or track a claim</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { marginTop: Spacing.xxl },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 22,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  card: {
    marginHorizontal: Spacing.screenPadding,
    padding: Spacing.lg,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  field: { marginTop: Spacing.sm },
  fieldLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  fieldValue: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  fieldGap: { marginBottom: Spacing.sm },
  claimLink: {
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  claimLinkText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.brandGreen,
    textAlign: 'center',
  },
})
