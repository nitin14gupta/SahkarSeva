import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import {
  BadgeCheck,
  Bolt,
  Handshake,
  History,
  Search,
  SlidersHorizontal,
  Star,
  Verified,
  X,
  Zap,
} from 'lucide-react-native'
import { AppHeader, CategoryIcon, NotificationBell } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { Colors, FontFamily, Spacing, withOpacity } from '@/constants'
import type { Category } from '@/types/catalog'
import type { BookingSummary } from '@/types/booking'

export default function CustomerHomeScreen() {
  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [recentBookings, setRecentBookings] = useState<BookingSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const pingScale = useSharedValue(1)
  const pingOpacity = useSharedValue(0.6)

  useEffect(() => {
    pingScale.value = withRepeat(
      withTiming(1.8, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      -1, false,
    )
    pingOpacity.value = withRepeat(
      withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      -1, false,
    )
  }, [pingScale, pingOpacity])

  const pingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pingScale.value }],
    opacity: pingOpacity.value,
  }))

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(false)
      try {
        const [{ categories }, { bookings }] = await Promise.all([
          apiService.getCategories(),
          apiService.getBookings(),
        ])
        if (cancelled) return
        setCategories(categories)
        setRecentBookings(bookings.slice(0, 5))
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [refreshKey])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const [{ categories }, { bookings }] = await Promise.all([
        apiService.getCategories(),
        apiService.getBookings(),
      ])
      setCategories(categories)
      setRecentBookings(bookings.slice(0, 5))
    } catch {
      // keep whatever was already showing
    } finally {
      setRefreshing(false)
    }
  }

  function handleSearchSubmit() {
    if (!query.trim()) return
    router.push({ pathname: '/search', params: { q: query.trim() } })
  }

  if (loading) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator color={Colors.brandGreen} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={[s.container, s.center]}>
        <Text style={s.errorText}>Couldn&apos;t load the home screen.</Text>
        <Pressable onPress={() => setRefreshKey((k) => k + 1)} hitSlop={8}>
          <Text style={s.retry}>Tap to retry</Text>
        </Pressable>
      </View>
    )
  }

  const discoveryChips: {
    key: string
    label: string
    icon: string
    active: boolean
    isPulse?: boolean
  }[] = [
    { key: 'fast', label: 'Fast dispatch', icon: '⚡', active: true },
    { key: 'rated', label: '4.8+ rated', icon: '★', active: false },
    { key: 'insured', label: 'Bylaw insured', icon: 'shield', active: false },
    { key: 'active', label: '34 active nearby', icon: 'pulse', active: false, isPulse: true },
  ]

  return (
    <View style={s.container}>
      <AppHeader showLogo rightAction={<NotificationBell />} />

      <ScrollView
        contentContainerStyle={{ paddingTop: Spacing.md, paddingBottom: Spacing.xxl }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.brandGreen]}
            tintColor={Colors.brandGreen}
          />
        }
      >
        {/* ========================================================= */}
        {/*  SECTION 1: Search + Quick Discovery Chips                */}
        {/* ========================================================= */}
        <View style={s.searchWrap}>
          <View style={s.searchBoxWrap}>
            <View style={s.searchBox}>
              <Search size={18} color={Colors.textSecondary} strokeWidth={2} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearchSubmit}
                placeholder="Search electrician, plumber, carpenter..."
                placeholderTextColor={withOpacity(Colors.textSecondary, 0.7)}
                returnKeyType="search"
                style={s.searchInput}
              />
              {!!query && (
                <Pressable onPress={() => setQuery('')} hitSlop={8} style={{ marginRight: 6 }}>
                  <X size={16} color={Colors.textSecondary} strokeWidth={2} />
                </Pressable>
              )}
              <Pressable style={s.filterBtn} hitSlop={8}>
                <SlidersHorizontal size={16} color={Colors.brandGreen} strokeWidth={2} />
              </Pressable>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {discoveryChips.map((chip, i) => {
              const ml = i === 0 ? ({} as React.ComponentProps<typeof View>['style']) : { marginLeft: 6 }
              if (chip.active) {
                return (
                  <View key={chip.key} style={[s.chipActive, ml]}>
                    <Text style={s.chipActiveIcon}>{chip.icon}</Text>
                    <Text style={s.chipActiveText}>{chip.label}</Text>
                  </View>
                )
              }
              if (chip.isPulse) {
                return (
                  <View key={chip.key} style={[s.chipPulse, ml]}>
                    <View style={s.pulseDotWrap}>
                      <Animated.View
                        style={[s.pulseDotBase, s.pulseDotOuter, pingStyle]}
                      />
                      <View style={s.pulseDotBase} />
                    </View>
                    <Text style={s.chipPulseText}>{chip.label}</Text>
                  </View>
                )
              }
              return (
                <View key={chip.key} style={[s.chipInactive, ml]}>
                  {chip.icon === 'shield' ? (
                    <BadgeCheck size={13} color={Colors.brandGreen} strokeWidth={2.2} style={{ marginRight: 4 }} />
                  ) : (
                    <Text style={[s.chipInactiveIcon, { marginRight: 4 }]}>{chip.icon}</Text>
                  )}
                  <Text style={s.chipInactiveText}>{chip.label}</Text>
                </View>
              )
            })}
          </ScrollView>
        </View>

        {/* ========================================================= */}
        {/*  SECTION 2: Terracotta Emergency Service Banner          */}
        {/* ========================================================= */}
        <View style={s.sectionWrap}>
          <Pressable onPress={() => router.push('/emergency')}>
            <View style={s.emergencyCard}>
              <View style={s.emergencyBlob} />
              <View>
                {/* Row 1 */}
                <View style={s.emergencyRow1}>
                  <View style={s.emergencyLeftTitle}>
                    <View style={s.pingWrap}>
                      <Animated.View
                        style={[{ position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' }, pingStyle]}
                      />
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' }} />
                    </View>
                    <Bolt size={11} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" style={{ marginRight: 2 }} />
                    <Text style={s.emergencyDispatchText}>EMERGENCY DISPATCH</Text>
                  </View>
                  <View style={s.emergencyEtaPill}>
                    <Text style={s.emergencyEtaText}>~14 MIN ARRIVAL</Text>
                  </View>
                </View>

                {/* Row 2 */}
                <View style={{ marginBottom: 8 }}>
                  <Text style={s.emergencyTitle}>Urgent Home Malfunctions?</Text>
                  <Text style={s.emergencySubtitle}>
                    Pipe bursts, sparks, lockouts &amp; live wire hazards.
                  </Text>
                </View>

                {/* Row 3 */}
                <View style={s.emergencyRow3}>
                  <View style={s.emergencyGuaranteeLeft}>
                    <Verified size={13} color="#FFFFFF" strokeWidth={2.2} style={{ marginRight: 4 }} />
                    <Text style={s.emergencyGuaranteeText}>Cooperative Bylaw Guarantee</Text>
                  </View>
                  <View style={s.emergencyCtaBtn}>
                    <Text style={s.emergencyCtaText}>Request Now</Text>
                    <Zap size={14} color={Colors.terracotta} strokeWidth={2.4} fill={Colors.terracotta} />
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        </View>

        {/* ========================================================= */}
        {/*  SECTION 3: Services by Trade 5-column grid              */}
        {/* ========================================================= */}
        <View style={s.sectionWrap}>
          <View style={s.sectionHeader}>
            <View style={s.sectionHeaderLeft}>
              <Text style={s.sectionTitle}>Services by Trade</Text>
              <Text style={s.sectionMeta}>• Fair Wages</Text>
            </View>
            <Pressable hitSlop={8}>
              <Text style={s.viewRatesText}>View rates</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {categories.map((item) => (
              <View key={item.id} style={{ width: '20%' }}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/category/[name]',
                      params: { name: item.name },
                    })
                  }
                  hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
                  style={{ alignItems: 'center', paddingVertical: 8 }}
                >
                  <View style={s.serviceTile}>
                    <CategoryIcon name={item.icon} size={21} />
                  </View>
                  <Text style={s.serviceTileLabel} numberOfLines={1}>
                    {item.name}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* ========================================================= */}
        {/*  SECTION 4: Recently Booked Workers (horizontal)         */}
        {/* ========================================================= */}
        {recentBookings.length > 0 && (
          <View>
            <View style={[s.sectionHeader, { paddingHorizontal: Spacing.screenPadding, marginBottom: Spacing.sm }]}>
              <View style={s.sectionHeaderLeft}>
                <Text style={s.sectionTitle}>Recently Booked</Text>
                <View style={s.locationPill}>
                  <Text style={s.locationPillText}>Indiranagar</Text>
                </View>
              </View>
              <Pressable hitSlop={8}>
                <Text style={s.viewRatesText}>View all</Text>
              </Pressable>
            </View>

            <FlatList
              data={recentBookings}
              keyExtractor={(b) => b.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing.screenPadding, paddingBottom: 4 }}
              ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/worker/[id]',
                      params: { id: item.worker_id },
                    })
                  }
                >
                  <View style={s.bookingCard}>
                    <View style={{ marginBottom: 8 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', flex: 1, marginRight: 8 }}>
                          <View style={s.bookingAvatarWrap}>
                            {item.worker_photo_url ? (
                              <Image
                                source={{ uri: item.worker_photo_url }}
                                style={{ width: '100%', height: '100%' }}
                              />
                            ) : null}
                          </View>
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Text style={s.bookingWorkerName} numberOfLines={1}>
                                {item.worker_name}
                              </Text>
                              <Verified size={13} color={Colors.brandGreen} strokeWidth={2.2} style={{ marginLeft: 2 }} />
                            </View>
                            <Text style={s.bookingCategory} numberOfLines={1}>
                              {item.category}
                            </Text>
                          </View>
                        </View>
                        <View style={s.ratingBadge}>
                          <Star
                            size={11}
                            color={Colors.brandGreen}
                            strokeWidth={2.2}
                            fill={Colors.brandGreen}
                            style={{ marginRight: 2 }}
                          />
                          <Text style={s.ratingText}>4.9</Text>
                        </View>
                      </View>
                    </View>
                    <View style={s.bookingDivider} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={s.priceText}>₹350</Text>
                        <Text style={s.perHrText}>/hr</Text>
                      </View>
                      <View style={s.bookAgainBtn}>
                        <History size={12} color="#FFFFFF" strokeWidth={2.2} style={{ marginRight: 2 }} />
                        <Text style={s.bookAgainText}>Book Again</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* ========================================================= */}
        {/*  SECTION 5: Cooperative Guarantee banner                 */}
        {/* ========================================================= */}
        <View style={{ paddingHorizontal: Spacing.screenPadding, marginTop: 14 }}>
          <View style={s.guaranteeBar}>
            <Handshake size={14} color={Colors.brandGreen} strokeWidth={2.2} style={{ marginRight: 6 }} />
            <Text style={s.guaranteeText}>
              100% Worker Owned • 0% Commission • ₹10k Guarantee
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  // ============ ORIGINAL WORKING CONTAINER ============
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

  // ============ SECTION SPACING ============
  searchWrap: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  sectionWrap: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 14,
    color: Colors.brandGreen,
    letterSpacing: -0.1,
    marginRight: 6,
  },
  sectionMeta: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 10.5,
    color: Colors.textSecondary,
  },
  viewRatesText: {
    fontFamily: FontFamily.headingSemiBold,
    fontSize: 11,
    color: Colors.terracotta,
  },

  // ============ SEARCH ============
  searchBoxWrap: {
    marginBottom: 8,
  },
  searchBox: {
    width: '100%',
    height: 40,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F5E9',
    shadowColor: '#023625',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 4,
    height: '100%',
    fontSize: 13,
    fontFamily: FontFamily.bodyRegular,
    color: Colors.textPrimary,
  },
  filterBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
  },

  // ============ DISCOVERY CHIPS ============
  chipActive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.brandGreen,
    shadowColor: '#023625',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  chipActiveIcon: {
    fontSize: 11,
    color: '#f6c343',
    marginRight: 4,
  },
  chipActiveText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: FontFamily.headingSemiBold,
  },
  chipPulse: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E8F5E9',
  },
  pulseDotWrap: {
    width: 6,
    height: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  pulseDotBase: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brandGreen,
  },
  pulseDotOuter: {
    position: 'absolute',
  },
  chipPulseText: {
    fontSize: 11,
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.brandGreen,
  },
  chipInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F5E9',
    shadowColor: '#023625',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  chipInactiveIcon: {
    fontSize: 11,
    color: '#f6c343',
  },
  chipInactiveText: {
    fontSize: 11,
    fontFamily: FontFamily.bodyMedium,
    color: Colors.textPrimary,
  },

  // ============ EMERGENCY CARD ============
  emergencyCard: {
    position: 'relative',
    width: '100%',
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
    backgroundColor: Colors.terracotta,
    shadowColor: '#C05B41',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  emergencyBlob: {
    position: 'absolute',
    right: -24,
    bottom: -24,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  emergencyRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  emergencyLeftTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pingWrap: {
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  emergencyDispatchText: {
    fontSize: 10.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#FFFFFF',
    fontFamily: FontFamily.headingBold,
  },
  emergencyEtaPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  emergencyEtaText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: FontFamily.headingBold,
    letterSpacing: 0.2,
  },
  emergencyTitle: {
    fontSize: 16,
    lineHeight: 20,
    color: '#FFFFFF',
    fontFamily: FontFamily.headingBold,
  },
  emergencySubtitle: {
    fontSize: 11.5,
    marginTop: 2,
    color: '#FFFFFF',
    fontFamily: FontFamily.bodyMedium,
    opacity: 0.92,
  },
  emergencyRow3: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  emergencyGuaranteeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyGuaranteeText: {
    fontSize: 10.5,
    color: '#FFFFFF',
    fontFamily: FontFamily.bodyMedium,
    opacity: 0.95,
  },
  emergencyCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    shadowColor: '#023625',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 1,
  },
  emergencyCtaText: {
    fontSize: 12,
    fontFamily: FontFamily.headingBold,
    color: Colors.terracotta,
    marginRight: 2,
  },

  // ============ SERVICE TILE GRID ============
  serviceTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    shadowColor: '#023625',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  serviceTileLabel: {
    fontSize: 10.5,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
    fontFamily: FontFamily.bodyMedium,
    color: Colors.textPrimary,
  },

  // ============ RECENTLY BOOKED CARD ============
  bookingCard: {
    width: 230,
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8F5E9',
    shadowColor: '#023625',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  bookingAvatarWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#E8F5E9',
    marginRight: 8,
  },
  bookingWorkerName: {
    fontSize: 12,
    flexShrink: 1,
    fontFamily: FontFamily.headingBold,
    color: Colors.textPrimary,
  },
  bookingCategory: {
    fontSize: 10,
    fontFamily: FontFamily.bodyRegular,
    color: Colors.textSecondary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#E8F5E9',
  },
  ratingText: {
    fontSize: 10.5,
    fontFamily: FontFamily.headingBold,
    color: Colors.brandGreen,
  },
  bookingDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(226,232,240,0.7)',
    marginTop: 4,
  },
  priceText: {
    fontSize: 13,
    fontFamily: FontFamily.headingBold,
    color: Colors.brandGreen,
  },
  perHrText: {
    fontSize: 10,
    fontFamily: FontFamily.bodyRegular,
    color: Colors.textSecondary,
  },
  bookAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.brandGreen,
  },
  bookAgainText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: FontFamily.headingSemiBold,
  },
  locationPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#E8F5E9',
  },
  locationPillText: {
    fontSize: 10,
    fontFamily: FontFamily.bodyMedium,
    color: Colors.brandGreen,
  },

  // ============ GUARANTEE BAR ============
  guaranteeBar: {
    width: '100%',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: withOpacity(Colors.brandGreen, 0.15),
    shadowColor: '#023625',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  guaranteeText: {
    fontSize: 10.5,
    textAlign: 'center',
    fontFamily: FontFamily.headingSemiBold,
    color: Colors.brandGreen,
  },
})
