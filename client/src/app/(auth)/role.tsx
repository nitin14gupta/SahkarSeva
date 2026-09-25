import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Defs, G, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import {
  ArrowRight,
  BadgeCheck,
  BadgeDollarSign,
  Check,
  HandCoins,
  Handshake,
  HeartHandshake,
  Info,
  Scale,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Wrench,
} from 'lucide-react-native'
import { BackButton, LogoMark, PrimaryButton } from '@/components/ui'
import { Colors, FontFamily } from '@/constants'
import type { Role } from '@/types/auth'

export default function RoleScreen() {
  const insets = useSafeAreaInsets()
  const [role, setRole] = useState<Role | null>(null)

  const blob1Scale = useSharedValue(1)
  const blob2Scale = useSharedValue(1)
  const blob3Scale = useSharedValue(1)
  const blob1Trans = useSharedValue(0)
  const blob2Trans = useSharedValue(0)
  const blob3Trans = useSharedValue(0)

  useEffect(() => {
    blob1Scale.value = withRepeat(
      withTiming(1.18, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    )
    blob2Scale.value = withRepeat(
      withTiming(1.14, { duration: 16000, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    )
    blob3Scale.value = withRepeat(
      withTiming(1.1, { duration: 18000, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    )
    blob1Trans.value = withRepeat(
      withTiming(-18, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    )
    blob2Trans.value = withRepeat(
      withTiming(22, { duration: 16000, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    )
    blob3Trans.value = withRepeat(
      withTiming(14, { duration: 18000, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    )
  }, [blob1Scale, blob2Scale, blob3Scale, blob1Trans, blob2Trans, blob3Trans])

  const blob1Style = useAnimatedStyle(() => ({
    transform: [{ scale: blob1Scale.value }, { translateY: blob1Trans.value }],
  }))
  const blob2Style = useAnimatedStyle(() => ({
    transform: [{ scale: blob2Scale.value }, { translateY: blob2Trans.value }],
  }))
  const blob3Style = useAnimatedStyle(() => ({
    transform: [{ scale: blob3Scale.value }, { translateY: blob3Trans.value }],
  }))

  function handleContinue() {
    if (!role) return
    router.push({ pathname: '/profile-setup', params: { role } })
  }

  function ctaLabel(): string {
    if (role === 'customer') return 'Continue as Customer'
    if (role === 'worker') return 'Join Co-op as Artisan'
    return 'Continue'
  }

  return (
    <LinearGradient
      colors={['#E8F5E9', '#E8F5E9', '#FAF8F5', '#FAF8F5']}
      locations={[0, 0.38, 0.58, 1]}
      style={{ flex: 1 }}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: -80,
              left: -50,
              width: 360,
              height: 360,
              borderRadius: 180,
              backgroundColor: 'rgba(188, 238, 211, 0.55)',
            },
            blob1Style,
          ]}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 130,
              right: -90,
              width: 380,
              height: 380,
              borderRadius: 190,
              backgroundColor: 'rgba(255, 219, 210, 0.4)',
            },
            blob2Style,
          ]}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 20,
              left: -80,
              width: 420,
              height: 420,
              borderRadius: 210,
              backgroundColor: 'rgba(200, 235, 215, 0.5)',
            },
            blob3Style,
          ]}
        />
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 400 800"
          preserveAspectRatio="none"
          style={{ opacity: 0.35, position: 'absolute', inset: 0 }}
        >
          <Defs>
            <SvgLinearGradient id="greenGrad1" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#3a6753" stopOpacity="0.3" />
              <Stop offset="50%" stopColor="#1f4d3a" stopOpacity="0.55" />
              <Stop offset="100%" stopColor="#a1d1b8" stopOpacity="0.2" />
            </SvgLinearGradient>
            <SvgLinearGradient id="greenGrad2" x1="1" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#9e412a" stopOpacity="0.25" />
              <Stop offset="50%" stopColor="#3a6753" stopOpacity="0.45" />
              <Stop offset="100%" stopColor="#1f4d3a" stopOpacity="0.15" />
            </SvgLinearGradient>
          </Defs>
          <G fill="none" strokeLinecap="round" strokeWidth={1.4}>
            <Path
              d="M-50,180 C80,120 220,240 450,160"
              stroke="url(#greenGrad1)"
              strokeDasharray="6 6"
            />
            <Path d="M-40,360 C120,290 260,430 460,330" stroke="url(#greenGrad2)" strokeWidth={1.2} />
            <Path
              d="M-60,580 C100,520 280,640 460,560"
              stroke="url(#greenGrad1)"
              strokeDasharray="4 8"
            />
          </G>
        </Svg>
      </View>

      <View
        style={{
          flex: 1,
          paddingTop: Math.max(insets.top, 10),
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        <View className="flex-row items-center justify-between px-6 pt-1">
          <View className="flex-row items-center gap-2">
            <BackButton onPress={() => router.back()} transparent />
            <View className="flex-row items-center gap-1.5">
              <LogoMark size={20} />
              <View className="flex-col">
                <Text
                  className="text-[14px] text-brandGreen leading-none"
                  style={{ fontFamily: FontFamily.headingBold, letterSpacing: 0.1 }}
                >
                  SahkarSeva
                </Text>
                <Text
                  className="text-[10.5px] text-textSecondary mt-0.5 leading-none"
                  style={{ fontFamily: FontFamily.bodyRegular }}
                >
                  Role Selection
                </Text>
              </View>
            </View>
          </View>
          <View
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: Colors.brandGreen }}
          >
            <UserRound size={15} color="#FFFFFF" strokeWidth={2.3} />
          </View>
        </View>

        <View className="w-full px-6 pt-3">
          <View className="flex-row items-center gap-1.5 self-start px-3 py-1 rounded-full bg-[#BCEED3]/90 border border-emerald-600/15 mb-2"
            style={{
              shadowColor: '#1F4D3A',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.03,
              shadowRadius: 6,
            }}
          >
            <Users size={13} color={Colors.brandGreen} strokeWidth={2.3} />
            <Text
              className="text-[11px] text-brandGreen uppercase"
              style={{ fontFamily: FontFamily.headingSemiBold, letterSpacing: 0.5 }}
            >
              Worker-Owned Cooperative
            </Text>
          </View>

          <Text
            className="text-[26px] text-textPrimary leading-[32px] mt-1"
            style={{ fontFamily: FontFamily.headingBold, letterSpacing: -0.3 }}
          >
            How will you use SahkarSeva?
          </Text>
          <Text
            className="text-[13.5px] leading-[20px] text-textSecondary mt-1.5"
            style={{ fontFamily: FontFamily.bodyRegular }}
          >
            Choose how you&apos;d like to get started today. You can&apos;t switch this later
            without contacting support.
          </Text>
        </View>

        <View className="w-full px-6 mt-4" style={{ rowGap: 12 }}>
          <RoleStackCard
            variant="customer"
            selected={role === 'customer'}
            onPress={() => setRole('customer')}
          />
          <RoleStackCard
            variant="worker"
            selected={role === 'worker'}
            onPress={() => setRole('worker')}
          />
        </View>

        <View className="w-full px-6 mt-4">
          <View
            className="w-full flex-row items-start gap-2 p-3 rounded-xl bg-white/90 border border-emerald-900/10"
            style={{
              shadowColor: '#023625',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
            }}
          >
            <Info size={17} color={Colors.brandGreen} strokeWidth={2.2} style={{ marginTop: 1 }} />
            <Text
              className="text-[12.5px] leading-[18px] text-[#214f3c] flex-1"
              style={{ fontFamily: FontFamily.bodyMedium }}
            >
              This choice sets your starting profile. Role additions are free — reach the Co-op
              support chat anytime.
            </Text>
          </View>
        </View>

        <View className="mt-auto w-full px-6 pt-4">
          <View className="relative w-full">
            <PrimaryButton
              label={ctaLabel()}
              onPress={handleContinue}
              disabled={!role}
            />
            {role ? (
              <View
                pointerEvents="none"
                className="absolute right-6 top-0 bottom-0 items-center justify-center"
              >
                <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.3} />
              </View>
            ) : null}
          </View>
          <View className="flex-row items-center justify-center gap-1.5 mt-3 opacity-90">
            <Users size={13} color={Colors.brandGreen} strokeWidth={2.3} />
            <Text
              className="text-[11.5px] text-brandGreen"
              style={{ fontFamily: FontFamily.bodyMedium }}
            >
              100% worker-owned & democratically governed
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  )
}

type RoleVariant = 'customer' | 'worker'

function RoleStackCard({
  variant,
  selected,
  onPress,
}: {
  variant: RoleVariant
  selected: boolean
  onPress: () => void
}) {
  const accent = variant === 'customer' ? Colors.brandGreen : Colors.terracotta
  const accentSoft =
    variant === 'customer' ? 'rgba(188, 238, 211, 0.55)' : 'rgba(255, 219, 210, 0.5)'
  const tagBg = variant === 'customer' ? '#BCEED3' : '#FFD9CD'
  const tagText = variant === 'customer' ? Colors.brandGreen : Colors.terracotta
  const tagLabel = variant === 'customer' ? 'Book Services' : 'Co-op Artisan'
  const title = variant === 'customer' ? 'I need a service' : 'I provide a service'
  const body =
    variant === 'customer'
      ? 'Hire cooperative-certified electricians, plumbers, carpenters, and technicians — fair rates, zero markups.'
      : 'Join as an equal co-owner. Keep 100% of your earnings with zero commissions and full collective voting rights.'
  const perks =
    variant === 'customer'
      ? ([
          { icon: HandCoins, label: 'Direct Fair Rates' },
          { icon: ShieldCheck, label: 'Certified Artisans' },
          { icon: Sparkles, label: 'Co-op Warranty' },
        ] as const)
      : ([
          { icon: BadgeDollarSign, label: '0% Commission' },
          { icon: Scale, label: 'Co-ownership Shares' },
          { icon: HeartHandshake, label: 'Instant Direct Payouts' },
        ] as const)

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${title}. ${body}`}
    >
      <View
        className="w-full rounded-2xl bg-white/95 p-4 border overflow-hidden"
        style={[
          {
            borderColor: selected ? accent : 'rgba(31, 77, 58, 0.10)',
            borderWidth: selected ? 2 : 1,
            shadowColor: selected ? accent : '#023625',
            shadowOffset: {
              width: 0,
              height: selected ? 8 : 2,
            },
            shadowOpacity: selected ? 0.14 : 0.04,
            shadowRadius: selected ? 20 : 12,
            elevation: selected ? 4 : 1,
          },
        ]}
      >
        {selected ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: -60,
              right: -40,
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: accentSoft,
              opacity: 0.9,
            }}
          />
        ) : null}

        <View className="flex-row items-start justify-between w-full mb-2.5">
          <View className="flex-row items-center gap-1.5">
            <View
              className="px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: tagBg }}
            >
              <Text
                className="text-[10.5px] uppercase tracking-wider"
                style={{
                  fontFamily: FontFamily.headingSemiBold,
                  color: tagText,
                  letterSpacing: 1.2,
                }}
              >
                {tagLabel}
              </Text>
            </View>
            {variant === 'customer' ? (
              <BadgeCheck size={17} color={Colors.brandGreen} strokeWidth={2.2} />
            ) : (
              <Handshake size={17} color={Colors.terracotta} strokeWidth={2.2} />
            )}
          </View>

          <View
            className="w-6 h-6 rounded-full items-center justify-center border"
            style={{
              backgroundColor: selected ? accent : '#EFEDE8',
              borderWidth: selected ? 0 : 1,
              borderColor: '#D6ECDE',
            }}
          >
            <Check
              size={13}
              color={selected ? '#FFFFFF' : accent}
              strokeWidth={2.8}
              style={{ opacity: selected ? 1 : 0 }}
            />
          </View>
        </View>

        <View className="flex-row items-start justify-between w-full gap-3">
          <View className="flex-1 min-w-0">
            <Text
              className="text-[20px] text-textPrimary leading-[24px]"
              style={{ fontFamily: FontFamily.headingBold }}
            >
              {title}
            </Text>
            <Text
              className="text-[13px] leading-[19px] text-textSecondary mt-1"
              style={{ fontFamily: FontFamily.bodyRegular }}
            >
              {body}
            </Text>
          </View>
          <View
            className="w-14 h-14 rounded-xl items-center justify-center border flex-shrink-0"
            style={{
              backgroundColor: accentSoft,
              borderColor: selected ? `${accent}33` : `${accent}1A`,
              borderWidth: 1,
              shadowColor: accent,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
            }}
          >
            {variant === 'customer' ? (
              <UserRound size={30} color={accent} strokeWidth={2} />
            ) : (
              <Wrench size={30} color={accent} strokeWidth={2} />
            )}
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2 mt-4">
          {perks.map((p, i) => (
            <View
              key={i}
              className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-lg border"
              style={{
                backgroundColor: 'rgba(250, 248, 245, 0.9)',
                borderColor: 'rgba(31, 77, 58, 0.05)',
              }}
            >
              <p.icon size={14} color={accent} strokeWidth={2.2} />
              <Text
                className="text-[11.5px] text-textSecondary"
                style={{ fontFamily: FontFamily.headingSemiBold }}
              >
                {p.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  )
}
