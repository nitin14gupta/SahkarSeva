import { useEffect, useState } from 'react'
import {
  Pressable, StyleSheet, Text, View,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { G, Path } from 'react-native-svg'
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
  Check,
  Globe2,
  HeartHandshake,
  Info,
} from 'lucide-react-native'
import {
  BackButton,
  LogoMark,
  PrimaryButton,
} from '@/components/ui'
import * as apiService from '@/api/apiService'
import { useAuthStore } from '@/store/authStore'
import { CacheKeys, Colors, FontFamily } from '@/constants'

type LangOption = {
  code: string
  label: string
  subtitle: string
  region: string
}

const LANGUAGES: readonly LangOption[] = [
  { code: 'en', label: 'English', subtitle: 'English', region: 'Primary' },
  { code: 'hi', label: 'हिन्दी', subtitle: 'Hindi', region: 'हिंदी' },
  { code: 'mr', label: 'मराठी', subtitle: 'Marathi', region: 'महाराष्ट्र' },
  { code: 'bn', label: 'বাংলা', subtitle: 'Bengali', region: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்', subtitle: 'Tamil', region: 'தமிழ்நாடு' },
  { code: 'te', label: 'తెలుగు', subtitle: 'Telugu', region: 'తెలుగు' },
] as const

export default function LanguageScreen() {
  const { from } = useLocalSearchParams<{ from?: string }>()
  const insets = useSafeAreaInsets()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const [selected, setSelected] = useState(
    from === 'profile' ? (user?.language ?? 'en') : 'en',
  )
  const [saving, setSaving] = useState(false)

  const blob1Scale = useSharedValue(1)
  const blob2Scale = useSharedValue(1)
  const blob1TransY = useSharedValue(0)
  const blob2TransY = useSharedValue(0)

  useEffect(() => {
    blob1Scale.value = withRepeat(
      withTiming(1.15, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    )
    blob2Scale.value = withRepeat(
      withTiming(1.1, { duration: 13000, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    )
    blob1TransY.value = withRepeat(
      withTiming(-18, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    )
    blob2TransY.value = withRepeat(
      withTiming(22, { duration: 13000, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    )
  }, [blob1Scale, blob2Scale, blob1TransY, blob2TransY])

  const blob1Style = useAnimatedStyle(() => ({
    transform: [
      { scale: blob1Scale.value },
      { translateY: blob1TransY.value },
    ],
  }))
  const blob2Style = useAnimatedStyle(() => ({
    transform: [
      { scale: blob2Scale.value },
      { translateY: blob2TransY.value },
    ],
  }))

  async function handleContinue() {
    await SecureStore.setItemAsync(CacheKeys.language, selected)

    if (from === 'profile' && user) {
      setSaving(true)
      try {
        const { user: updated } = await apiService.completeProfile({
          name: user.name ?? '',
          role: user.role ?? 'customer',
          language: selected,
        })
        setUser(updated)
      } finally {
        setSaving(false)
      }
      router.back()
      return
    }

    router.push('/phone')
  }

  const isProfile = from === 'profile'

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
              top: -60,
              left: -40,
              width: 280,
              height: 280,
              borderRadius: 140,
              backgroundColor: 'rgba(120, 209, 161, 0.22)',
            },
            blob1Style,
          ]}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 120,
              right: -60,
              width: 300,
              height: 300,
              borderRadius: 150,
              backgroundColor: 'rgba(247, 214, 203, 0.28)',
            },
            blob2Style,
          ]}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 40,
              left: -60,
              width: 260,
              height: 260,
              borderRadius: 130,
              backgroundColor: 'rgba(192, 240, 210, 0.32)',
            },
            useAnimatedStyle(() => ({
              transform: [
                { scale: withRepeat(
                  withTiming(1.1, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
                  -1, true,
                ) },
              ],
              opacity: withRepeat(
                withTiming(0.85, { duration: 11000, easing: Easing.inOut(Easing.sin) }),
                -1, true,
              ),
            })),
          ]}
        />
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 400 900"
          preserveAspectRatio="none"
          style={{ opacity: 0.18, position: 'absolute', inset: 0 }}
        >
          <G
            stroke="#1F4D3A"
            strokeLinecap="round"
            strokeWidth={1.1}
            fill="none"
          >
            <Path
              d="M-40 180 C 120 120, 240 260, 440 160"
              strokeDasharray="6 6"
              opacity={0.5}
            />
            <Path
              d="M-20 220 C 140 160, 260 300, 460 200"
              opacity={0.35}
            />
            <Path
              d="M-50 480 C 80 430, 290 560, 450 470"
              strokeDasharray="4 8"
              opacity={0.4}
            />
            <Path
              d="M-40 760 C 130 700, 250 830, 440 750"
              strokeDasharray="7 5"
              opacity={0.3}
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
        <View className="flex-row items-center justify-between px-6 pb-2">
          <View className="flex-row items-center gap-2">
            {isProfile ? (
              <BackButton onPress={() => router.back()} transparent />
            ) : null}
            <View className="flex-row items-center gap-1.5">
              <LogoMark size={isProfile ? 18 : 20} />
              <Text
                className="text-[14px] text-brandGreen"
                style={{ fontFamily: FontFamily.headingBold, letterSpacing: 0.1 }}
              >
                SahkarSeva
              </Text>
            </View>
          </View>
          {isProfile ? (
            <View className="px-2.5 py-1 rounded-full bg-white/90 border border-divider">
              <Text
                className="text-[11.5px] text-textSecondary"
                style={{ fontFamily: FontFamily.headingSemiBold }}
              >
                Language Selection
              </Text>
            </View>
          ) : null}
        </View>

        <View className="w-full px-6 pt-2">
          <View className="w-full items-center">
            <View className="relative mb-3">
              <View
                className="w-[80px] h-[80px] rounded-2xl bg-white items-center justify-center overflow-hidden"
                style={{
                  shadowColor: '#023625',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.12,
                  shadowRadius: 18,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: 'rgba(31, 77, 58, 0.10)',
                }}
              >
                <View style={{ transform: [{ scale: 1.45 }] }}>
                  <LogoMark size={34} />
                </View>
              </View>
              <View
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full items-center justify-center border-[2px] border-white"
                style={{ backgroundColor: Colors.brandGreen }}
              >
                <Globe2 size={13.5} color="#FFFFFF" strokeWidth={2.3} />
              </View>
            </View>

            <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#C1E5CE] mb-2"
              style={{
                shadowColor: '#1F4D3A',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.03,
                shadowRadius: 8,
              }}
            >
              <HeartHandshake size={13} color={Colors.brandGreen} />
              <Text
                className="text-[11px] text-brandGreen"
                style={{ fontFamily: FontFamily.headingSemiBold, letterSpacing: 0.2 }}
              >
                Worker Owned Cooperative
              </Text>
            </View>

            <Text
              className="text-[26px] text-textPrimary leading-[32px] text-center"
              style={{ fontFamily: FontFamily.headingBold, letterSpacing: -0.3 }}
            >
              Choose your language
            </Text>
            <Text
              className="text-[13px] leading-[19px] text-textSecondary text-center mt-1.5 px-4"
              style={{ fontFamily: FontFamily.bodyRegular }}
            >
              Select your preferred language for bookings and support
            </Text>
            <Text
              className="text-[12px] text-brandGreen text-center mt-1"
              style={{ fontFamily: FontFamily.headingSemiBold }}
            >
              अपनी भाषा चुनें
            </Text>
          </View>

          <View className="mt-5 w-full" style={{ rowGap: 10 }}>
            <View className="w-full flex-row" style={{ columnGap: 10 }}>
              <LangCard
                lang={LANGUAGES[0]}
                selected={selected === LANGUAGES[0].code}
                onPress={() => setSelected(LANGUAGES[0].code)}
              />
              <LangCard
                lang={LANGUAGES[1]}
                selected={selected === LANGUAGES[1].code}
                onPress={() => setSelected(LANGUAGES[1].code)}
              />
            </View>
            <View className="w-full flex-row" style={{ columnGap: 10 }}>
              <LangCard
                lang={LANGUAGES[2]}
                selected={selected === LANGUAGES[2].code}
                onPress={() => setSelected(LANGUAGES[2].code)}
              />
              <LangCard
                lang={LANGUAGES[3]}
                selected={selected === LANGUAGES[3].code}
                onPress={() => setSelected(LANGUAGES[3].code)}
              />
            </View>
            <View className="w-full flex-row" style={{ columnGap: 10 }}>
              <LangCard
                lang={LANGUAGES[4]}
                selected={selected === LANGUAGES[4].code}
                onPress={() => setSelected(LANGUAGES[4].code)}
              />
              <LangCard
                lang={LANGUAGES[5]}
                selected={selected === LANGUAGES[5].code}
                onPress={() => setSelected(LANGUAGES[5].code)}
              />
            </View>
          </View>

          <View className="w-full items-center mt-4">
            <View className="flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white/85 border border-[#CFE6D6]">
              <Info size={15} color={Colors.brandGreen} />
              <Text
                className="text-[12px] text-brandGreen"
                style={{ fontFamily: FontFamily.bodyMedium }}
              >
                You can change your language anytime in settings.
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-auto w-full px-6 pt-3">
          <View className="relative w-full">
            <PrimaryButton
              label="Continue"
              onPress={handleContinue}
              loading={saving}
            />
            {!saving ? (
              <View
                pointerEvents="none"
                className="absolute right-6 top-0 bottom-0 items-center justify-center"
              >
                <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.3} />
              </View>
            ) : null}
          </View>
          <View className="flex-row items-center justify-center gap-1.5 mt-3 opacity-85">
            <BadgeCheck size={13} color={Colors.brandGreen} strokeWidth={2.3} />
            <Text
              className="text-[11.5px] text-brandGreen"
              style={{ fontFamily: FontFamily.bodyMedium }}
            >
              100% fair cooperative rates guaranteed
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  )
}

function LangCard({
  lang,
  selected,
  onPress,
}: {
  lang: LangOption
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1 }}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${lang.label}, ${lang.subtitle}`}
    >
      <View
        className="w-full rounded-2xl p-4 flex-col justify-between overflow-hidden"
        style={[
          {
            height: 106,
            borderWidth: selected ? 0 : 1,
            borderColor: '#D6ECDE',
            backgroundColor: selected ? Colors.brandGreen : '#FFFFFF',
            shadowColor: selected ? '#1F4D3A' : '#023625',
            shadowOffset: {
              width: 0,
              height: selected ? 8 : 2,
            },
            shadowOpacity: selected ? 0.22 : 0.04,
            shadowRadius: selected ? 18 : 8,
            elevation: selected ? 4 : 1,
          },
        ]}
      >
        {selected ? (
          <View
            style={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: 'rgba(161, 209, 184, 0.18)',
            }}
            pointerEvents="none"
          />
        ) : null}
        <View className="flex-row items-center justify-between w-full">
          <Text
            className="text-[11px] uppercase"
            style={{
              fontFamily: FontFamily.headingSemiBold,
              letterSpacing: lang.code === 'en' ? 1.4 : 0,
              color: selected
                ? 'rgba(188, 238, 211, 0.95)'
                : Colors.textSecondary,
              opacity: selected ? 0.95 : 1,
            }}
          >
            {lang.region}
          </Text>
          <View
            className="w-6 h-6 rounded-full items-center justify-center"
            style={{
              backgroundColor: selected
                ? 'rgba(255, 255, 255, 0.20)'
                : 'rgba(230, 244, 236, 1)',
              opacity: selected ? 1 : 0,
            }}
          >
            <Check
              size={14}
              color={selected ? '#FFFFFF' : Colors.brandGreen}
              strokeWidth={2.6}
            />
          </View>
        </View>
        <View>
          <Text
            className="text-[20px] leading-[24px]"
            style={{
              fontFamily: FontFamily.headingBold,
              color: selected ? '#FFFFFF' : Colors.textPrimary,
            }}
          >
            {lang.label}
          </Text>
          <Text
            className="text-[12.5px] mt-0.5"
            style={{
              fontFamily: FontFamily.bodyRegular,
              color: selected
                ? 'rgba(220, 240, 228, 0.92)'
                : Colors.textSecondary,
            }}
          >
            {lang.subtitle}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}
