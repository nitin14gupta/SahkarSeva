import { useEffect, useRef, useState } from 'react'
import {
  Dimensions, NativeScrollEvent, NativeSyntheticEvent,
  Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Circle, G, Path, Rect, Line, Polygon, Text as SvgText } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import {
  BadgeCheck,
  ShieldCheck,
  HeartHandshake,
  Users,
  Scale,
  Sparkles,
} from 'lucide-react-native'
import { LogoMark, PrimaryButton } from '@/components/ui'
import { CacheKeys, Colors, FontFamily, Spacing } from '@/constants'

const { width } = Dimensions.get('window')

const SLIDES = [
  {
    title: 'Workers who own the platform.',
    subtitle:
      'Every artisan on SahkarSeva is an equal co-owner — guaranteeing 100% fair wages, transparent bookings, and dignified work.',
    stat1: { label: 'Worker Cut', value: '0% Commission' },
    stat2: { label: 'Governance', value: '1 Member, 1 Vote' },
    trust: '100% Worker-Owned Collective',
    badge1: { label: '100% Retained Value', color: Colors.terracotta },
    badge2: { label: 'Co-Op Certified', color: Colors.brandGreen },
  },
  {
    title: 'Cooperative-verified, not algorithm-verified.',
    subtitle:
      'Skills, identity & trust are vouched for by fellow member artisans — not opaque scoring or hidden deactivations.',
    stat1: { label: 'Verification', value: 'Peer Reviewed' },
    stat2: { label: 'Identity', value: 'Co-Op Attested' },
    trust: 'Community Vouched Profiles',
    badge1: { label: 'No Algorithms', color: Colors.brandGreen },
    badge2: { label: 'Face-to-Face Checks', color: Colors.gold },
  },
  {
    title: 'Welfare that follows you.',
    subtitle:
      'Health cover, savings, skill upgrades, and pension benefits move with every booking — built into every job.',
    stat1: { label: 'Health Cover', value: 'Included' },
    stat2: { label: 'Savings', value: 'Per-Job Deposit' },
    trust: 'Member Welfare Embedded',
    badge1: { label: 'Insurance Included', color: Colors.brandGreen },
    badge2: { label: 'Skill Upgrades', color: Colors.terracotta },
  },
] as const

async function finishOnboarding() {
  await SecureStore.setItemAsync(CacheKeys.onboardingSeen, '1')
  router.replace('/language')
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets()
  const [index, setIndex] = useState(0)
  const scrollRef = useRef<ScrollView>(null)

  const blob1Scale = useSharedValue(1)
  const blob2Scale = useSharedValue(1)

  useEffect(() => {
    blob1Scale.value = withRepeat(
      withTiming(1.18, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    )
    blob2Scale.value = withRepeat(
      withTiming(1.14, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    )
  }, [blob1Scale, blob2Scale])

  const blob1Style = useAnimatedStyle(() => ({
    transform: [{ scale: blob1Scale.value }],
  }))
  const blob2Style = useAnimatedStyle(() => ({
    transform: [{ scale: blob2Scale.value }],
  }))

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(e.nativeEvent.contentOffset.x / width)
    if (next !== index) setIndex(next)
  }

  const isLast = index === SLIDES.length - 1

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
              top: -50,
              left: -30,
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: 'rgba(31, 77, 58, 0.06)',
            },
            blob1Style,
          ]}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 40,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: 'rgba(72, 180, 97, 0.07)',
            },
            blob2Style,
          ]}
        />
        <Svg
          width="100%"
          height={240}
          viewBox="0 0 390 280"
          style={{ opacity: 0.16 }}
          preserveAspectRatio="none"
        >
          <G
            opacity={0.7}
            stroke="#1F4D3A"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.1}
          >
            <Path
              d="M-40 150 C40 90, 110 30, 195 30 C280 30, 350 100, 430 160"
              strokeDasharray="3,3"
            />
            <Path d="M-20 180 C60 120, 125 60, 195 60 C265 60, 330 130, 410 190" />
            <Path
              d="M0 210 C80 150, 140 90, 195 90 C250 90, 310 160, 390 220"
              strokeDasharray="2,4"
            />
            <Path d="M195 10 V 140" />
          </G>
          <G opacity={0.6} stroke="#D4A359" strokeWidth={1}>
            <Circle cx={195} cy={30} r={12} strokeDasharray="2,3" />
            <Circle cx={110} cy={100} r={24} strokeDasharray="4,4" />
            <Circle cx={280} cy={100} r={24} strokeDasharray="4,4" />
          </G>
        </Svg>
      </View>

      <View
        style={{
          paddingTop: Math.max(insets.top, 10),
          paddingBottom: Math.max(insets.bottom, 16),
          flex: 1,
        }}
      >
        <View className="flex-row items-center justify-between px-6 pb-3">
          <View className="flex-row items-center gap-1.5">
            <LogoMark size={20} />
            <Text
              className="text-[14px] text-brandGreen"
              style={{ fontFamily: FontFamily.headingBold, letterSpacing: 0.1 }}
            >
              SahkarSeva
            </Text>
          </View>
          <Pressable onPress={finishOnboarding} hitSlop={8}>
            <View className="px-3 py-1.5 rounded-full bg-white/90 border border-divider">
              <Text
                className="text-[13px]"
                style={{ fontFamily: FontFamily.bodyMedium, color: Colors.textSecondary }}
              >
                Skip
              </Text>
            </View>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
        >
          {SLIDES.map((slide, i) => (
            <View key={i} style={{ width, paddingHorizontal: Spacing.screenPadding }}>
              <View
                className="w-full rounded-2xl bg-white border border-divider overflow-hidden"
                style={{
                  shadowColor: '#1E1A16',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.04,
                  shadowRadius: 12,
                  elevation: 2,
                }}
              >
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  <View
                    style={{
                      position: 'absolute',
                      top: -36,
                      right: -36,
                      width: 160,
                      height: 160,
                      borderRadius: 80,
                      backgroundColor: 'rgba(31, 77, 58, 0.07)',
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      bottom: -30,
                      left: -30,
                      width: 140,
                      height: 140,
                      borderRadius: 70,
                      backgroundColor: 'rgba(212, 160, 23, 0.08)',
                    }}
                  />
                </View>

                <View className="w-full items-center justify-center py-5">
                  {i === 0 ? (
                    <Svg width={220} height={180} viewBox="0 0 320 240" fill="none">
                      <Circle cx="160" cy="120" r="90" fill="#FAF8F5" stroke="#E7E1D8" strokeWidth="1.5" />
                      <Circle cx="160" cy="120" r="70" fill="#E8F5E9" fillOpacity={0.6} />
                      <Path
                        d="M90 110 C90 72, 230 72, 230 110 C230 148, 90 148, 90 110 Z"
                        opacity={0.35}
                        stroke="#1F4D3A"
                        strokeDasharray="5 5"
                        strokeWidth={2.5}
                      />
                      <G transform="translate(160, 48)">
                        <Path d="M0 0 C-12 -12 -18 -28 0 -36 C18 -28 12 -12 0 0 Z" fill="#1F4D3A" />
                        <Path
                          d="M-5 -18 C-14 -20 -20 -14 -24 -6 C-16 -2 -8 -8 -5 -18 Z"
                          fill="#A1D1B8"
                        />
                        <Path
                          d="M5 -18 C14 -20 20 -14 24 -6 C16 -2 8 -8 5 -18 Z"
                          fill="#BF5130"
                          opacity={0.85}
                        />
                      </G>
                      <Path
                        d="M110 202 C134 216 186 216 210 202 C218 178 226 160 220 146 C200 156 120 156 100 146 C94 160 100 178 110 202 Z"
                        fill="#1F4D3A"
                      />
                      <Circle cx="160" cy="178" r="14" fill="#BF5130" />
                      <Path d="M154 178 L159 183 L168 174" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                      <Path d="M72 128 L100 116 C106 114 114 116 118 122 L132 138" stroke="#BF5130" strokeLinecap="round" strokeLinejoin="round" strokeWidth={12} />
                      <Path d="M248 128 L220 116 C214 114 206 116 202 122 L188 138" stroke="#1F4D3A" strokeLinecap="round" strokeLinejoin="round" strokeWidth={12} />
                      <Rect fill="#EEE0D2" height={22} rx={7} stroke="#1F4D3A" strokeWidth={2} width={34} x="143" y="118" />
                      <Path d="M152 124 H168" stroke="#1F4D3A" strokeLinecap="round" strokeWidth={2.2} />
                      <Path d="M152 130 H168" stroke="#1F4D3A" strokeLinecap="round" strokeWidth={2.2} />
                      <Path d="M152 136 H164" stroke="#1F4D3A" strokeLinecap="round" strokeWidth={2.2} />
                    </Svg>
                  ) : i === 1 ? (
                    <Svg width={220} height={180} viewBox="0 0 320 240" fill="none">
                      <Circle cx="160" cy="120" r="90" fill="#FAF8F5" stroke="#E7E1D8" strokeWidth="1.5" />
                      <Circle cx="160" cy="120" r="72" fill="#E8F5E9" fillOpacity={0.55} />
                      <Path
                        d="M160 38 L168 56 L188 58 L174 72 L177 92 L160 82 L143 92 L146 72 L132 58 L152 56 Z"
                        fill="#BF5130"
                        opacity={0.9}
                      />
                      <Path
                        d="M160 56 L163 63 L171 63.5 L165 68.5 L166.5 76 L160 72 L153.5 76 L155 68.5 L149 63.5 L157 63 Z"
                        fill="#FFF6D6"
                      />
                      <G transform="translate(160, 140)">
                        <Path
                          d="M-52 -6 L-52 34 C-52 46, -42 56, -30 56 L30 56 C42 56, 52 46, 52 34 L52 -6 Z"
                          fill="#1F4D3A"
                        />
                        <Path
                          d="M-52 -6 L0 -32 L52 -6"
                          fill="#BF5130"
                          opacity={0.9}
                        />
                        <Line x1="0" y1="-6" x2="0" y2="56" stroke="#EEE0D2" strokeWidth={1.4} />
                        <Circle cx={0} cy={22} r={8} fill="#FFF6D6" />
                        <BadgeCenter />
                      </G>
                      <Circle cx="100" cy="90" r="4" fill="#1F4D3A" />
                      <Circle cx="220" cy="92" r="4.5" fill="#BF5130" />
                      <Circle cx="160" cy="204" r="4" fill="#D4A017" />
                    </Svg>
                  ) : (
                    <Svg width={220} height={180} viewBox="0 0 320 240" fill="none">
                      <Circle cx="160" cy="120" r="90" fill="#FAF8F5" stroke="#E7E1D8" strokeWidth="1.5" />
                      <Circle cx="160" cy="120" r="72" fill="#E8F5E9" fillOpacity={0.55} />
                      <G transform="translate(160, 108)">
                        <Path
                          d="M0 -36 C-16 -54, -52 -50, -52 -18 C-52 14, -22 42, 0 66 C22 42, 52 14, 52 -18 C52 -50, 16 -54, 0 -36 Z"
                          fill="#BF5130"
                          opacity={0.92}
                        />
                        <Path
                          d="M0 -28 C-12 -44, -42 -40, -42 -14 C-42 10, -18 34, 0 54 C18 34, 42 10, 42 -14 C42 -40, 12 -44, 0 -28 Z"
                          fill="#FFD9CD"
                        />
                      </G>
                      <G transform="translate(68, 70)">
                        <Circle cx="0" cy="0" r="22" fill="#1F4D3A" opacity={0.9} />
                        <ShieldMini />
                      </G>
                      <G transform="translate(252, 70)">
                        <Circle cx="0" cy="0" r="22" fill="#D4A017" opacity={0.9} />
                        <CoinMini />
                      </G>
                      <G transform="translate(70, 180)">
                        <Circle cx="0" cy="0" r="18" fill="#A1D1B8" />
                        <SparkMini />
                      </G>
                      <G transform="translate(250, 180)">
                        <Circle cx="0" cy="0" r="18" fill="#FFD9CD" />
                        <BookMini />
                      </G>
                    </Svg>
                  )}
                </View>

                <View className="w-full flex-row items-center justify-between px-3.5 pb-3.5">
                  <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-divider">
                    <View
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: slide.badge1.color }}
                    />
                    <Text
                      className="text-[11px] text-textPrimary"
                      style={{ fontFamily: FontFamily.headingSemiBold }}
                    >
                      {slide.badge1.label}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-divider">
                    <BadgeCheck size={12} color={slide.badge2.color} />
                    <Text
                      className="text-[11px] text-textPrimary"
                      style={{ fontFamily: FontFamily.headingSemiBold }}
                    >
                      {slide.badge2.label}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="w-full items-center mt-5">
                <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-brandGreen/10 border border-brandGreen/20 mb-2.5">
                  <ShieldCheck size={12} color={Colors.brandGreen} />
                  <Text
                    className="text-[11px] text-brandGreen"
                    style={{ fontFamily: FontFamily.headingSemiBold, letterSpacing: 0.2 }}
                  >
                    {slide.trust}
                  </Text>
                </View>

                <Text
                  className="text-[24px] text-textPrimary text-center leading-[30px] px-1"
                  style={{ fontFamily: FontFamily.headingBold, letterSpacing: -0.3 }}
                >
                  {slide.title}
                </Text>

                <Text
                  className="text-[13px] leading-[19px] text-center mt-2 px-1"
                  style={{ fontFamily: FontFamily.bodyRegular, color: Colors.textSecondary }}
                >
                  {slide.subtitle}
                </Text>

                <View
                  className="w-full mt-4 p-3 rounded-xl bg-white border border-divider flex-row items-center"
                  style={{
                    shadowColor: '#1E1A16',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.03,
                    shadowRadius: 8,
                    elevation: 1,
                  }}
                >
                  <View className="flex-row items-center gap-2 flex-1 pr-2">
                    {i === 0 ? (
                      <Users size={17} color={Colors.terracotta} />
                    ) : i === 1 ? (
                      <Scale size={17} color={Colors.terracotta} />
                    ) : (
                      <HeartHandshake size={17} color={Colors.terracotta} />
                    )}
                    <View>
                      <Text
                        className="text-[10.5px] uppercase tracking-wider"
                        style={{
                          fontFamily: FontFamily.headingSemiBold,
                          color: Colors.textSecondary,
                        }}
                      >
                        {slide.stat1.label}
                      </Text>
                      <Text
                        className="text-[13px] text-textPrimary"
                        style={{ fontFamily: FontFamily.headingBold }}
                      >
                        {slide.stat1.value}
                      </Text>
                    </View>
                  </View>
                  <View className="w-px h-8 bg-divider" />
                  <View className="flex-row items-center gap-2 flex-1 pl-3">
                    {i === 0 ? (
                      <Sparkles size={17} color={Colors.brandGreen} />
                    ) : i === 1 ? (
                      <Users size={17} color={Colors.brandGreen} />
                    ) : (
                      <BadgeCheck size={17} color={Colors.brandGreen} />
                    )}
                    <View>
                      <Text
                        className="text-[10.5px] uppercase tracking-wider"
                        style={{
                          fontFamily: FontFamily.headingSemiBold,
                          color: Colors.textSecondary,
                        }}
                      >
                        {slide.stat2.label}
                      </Text>
                      <Text
                        className="text-[13px] text-textPrimary"
                        style={{ fontFamily: FontFamily.headingBold }}
                      >
                        {slide.stat2.value}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <View className="px-6 mt-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              {SLIDES.map((_, i) => (
                <View
                  key={i}
                  className="h-2 rounded-full"
                  style={{
                    width: i === index ? 22 : 8,
                    backgroundColor:
                      i === index ? Colors.brandGreen : 'rgba(231, 225, 216, 1)',
                  }}
                />
              ))}
            </View>
            <PrimaryButton
              label={isLast ? 'Get Started' : 'Next'}
              onPress={() => {
                if (isLast) return finishOnboarding()
                scrollRef.current?.scrollTo({
                  x: width * (index + 1),
                  animated: true,
                })
              }}
            />
          </View>
        </View>
      </View>
    </LinearGradient>
  )
}

function BadgeCenter() {
  return (
    <G>
      <Circle cx={0} cy={0} r={5.5} fill="#1F4D3A" />
      <Path d="M-3 0 L-1 2 L4 -3" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
    </G>
  )
}

function ShieldMini() {
  return (
    <G transform="translate(-11, -13)">
      <Path
        d="M11 0 L22 5 L22 13 C22 20, 17 24, 11 26 C5 24, 0 20, 0 13 L0 5 Z"
        fill="#FFFFFF"
      />
      <Path d="M7 13 L10 16 L16 10" stroke="#1F4D3A" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </G>
  )
}

function CoinMini() {
  return (
    <G transform="translate(-12, -12)">
      <Circle cx={12} cy={12} r={10} fill="#FFFFFF" />
      <Circle cx={12} cy={12} r={10} stroke="#1F4D3A" strokeWidth={1.5} strokeDasharray="2 2" opacity={0.5} />
      <SvgText
        x={12}
        y={16.5}
        textAnchor="middle"
        fontSize={13}
        fontWeight="700"
        fill="#1F4D3A"
        fontFamily="PlusJakartaSans_700Bold"
      >
        ₹
      </SvgText>
    </G>
  )
}

function SparkMini() {
  return (
    <G transform="translate(-9, -9)">
      <Polygon
        points="9,0 11,6 18,9 11,12 9,18 7,12 0,9 7,6"
        fill="#1F4D3A"
      />
    </G>
  )
}

function BookMini() {
  return (
    <G transform="translate(-11, -10)">
      <Rect x="0" y="0" width="22" height="20" rx="4" fill="#FFFFFF" />
      <Line x1="5" y1="5" x2="17" y2="5" stroke="#BF5130" strokeWidth={2} strokeLinecap="round" />
      <Line x1="5" y1="10" x2="17" y2="10" stroke="#1F4D3A" strokeWidth={2} strokeLinecap="round" />
      <Line x1="5" y1="15" x2="13" y2="15" stroke="#D4A017" strokeWidth={2} strokeLinecap="round" />
    </G>
  )
}
