import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as Location from 'expo-location'
import * as SecureStore from 'expo-secure-store'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Circle, G } from 'react-native-svg'
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
  Camera,
  Handshake,
  Lock,
  MapPin,
  Plus,
  UserRound,
} from 'lucide-react-native'
import { BackButton, Input, KeyboardAvoidingWrapper, LogoMark, PrimaryButton, Screen } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useImageUpload } from '@/hooks/useImageUpload'
import { usePillStore } from '@/store/pillStore'
import { CacheKeys, Colors, FontFamily } from '@/constants'
import type { Role } from '@/types/auth'

export default function ProfileSetupScreen() {
  const { role } = useLocalSearchParams<{ role: Role }>()
  const insets = useSafeAreaInsets()
  const [name, setName] = useState('')
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { handleCompleteProfile } = useAuth()
  const { pickAndUpload, uploading } = useImageUpload('profile-photos')
  const show = usePillStore((s) => s.show)

  const blob1Scale = useSharedValue(1)
  const blob2Scale = useSharedValue(1)
  const blob3Scale = useSharedValue(1)
  const blob1Trans = useSharedValue(0)
  const blob2Trans = useSharedValue(0)
  const blob3Trans = useSharedValue(0)

  useEffect(() => {
    blob1Scale.value = withRepeat(
      withTiming(1.2, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    )
    blob2Scale.value = withRepeat(
      withTiming(1.14, { duration: 16000, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    )
    blob3Scale.value = withRepeat(
      withTiming(1.12, { duration: 18000, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    )
    blob1Trans.value = withRepeat(
      withTiming(-16, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    )
    blob2Trans.value = withRepeat(
      withTiming(20, { duration: 16000, easing: Easing.inOut(Easing.sin) }),
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

  async function pickPhoto() {
    try {
      const picked = await pickAndUpload()
      if (!picked) return
      setPhotoUri(picked.localUri)
      setPhotoUrl(picked.remoteUrl)
    } catch {
      show('Could not upload photo. You can try again later.', 'error')
    }
  }

  async function handleSubmit() {
    if (!name.trim() || !role) return
    setLoading(true)
    try {
      await Location.requestForegroundPermissionsAsync()
      const language = (await SecureStore.getItemAsync(CacheKeys.language)) ?? 'en'
      await handleCompleteProfile({
        name: name.trim(),
        role,
        language,
        photo_url: photoUrl ?? undefined,
      })
      router.replace(
        role === 'worker' ? '/(worker)/register/personal' : '/(customer)/(tabs)/home',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingWrapper transparent>
        <LinearGradient
          colors={['#E8F5E9', '#E8F5E9', '#FAF8F5', '#FAF8F5']}
          locations={[0, 0.38, 0.58, 1]}
          style={{ flex: 1 }}
        >
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 360,
                backgroundColor: 'rgba(188, 238, 211, 0.35)',
                borderBottomLeftRadius: 40,
                borderBottomRightRadius: 40,
                opacity: 0.9,
              }}
            />
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: -56,
                  right: -56,
                  width: 256,
                  height: 256,
                  borderRadius: 128,
                  backgroundColor: 'rgba(29, 77, 56, 0.18)',
                },
                blob1Style,
              ]}
            />
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: 80,
                  left: -64,
                  width: 208,
                  height: 208,
                  borderRadius: 104,
                  backgroundColor: 'rgba(35, 92, 68, 0.12)',
                },
                blob2Style,
              ]}
            />
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  bottom: 40,
                  right: -80,
                  width: 300,
                  height: 300,
                  borderRadius: 150,
                  backgroundColor: 'rgba(35, 92, 68, 0.08)',
                },
                blob3Style,
              ]}
            />
            <Svg
              width="500"
              height="360"
              viewBox="0 0 500 360"
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                marginLeft: -250,
                opacity: 0.4,
              }}
            >
              <G fill="none">
                <Circle cx="250" cy="80" r="90" stroke="#1D4D38" strokeWidth={1} strokeDasharray="4 4" />
                <Circle cx="250" cy="80" r="140" stroke="#235C44" strokeWidth={1} strokeOpacity={0.6} />
                <Circle
                  cx="250"
                  cy="80"
                  r="190"
                  stroke="#1D4D38"
                  strokeWidth={1}
                  strokeOpacity={0.35}
                  strokeDasharray="2 6"
                />
                <Circle cx="250" cy="80" r="240" stroke="#235C44" strokeWidth={1} strokeOpacity={0.2} />
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
                  <Text
                    className="text-[15px] text-brandGreen leading-none"
                    style={{ fontFamily: FontFamily.headingSemiBold, letterSpacing: 0.1 }}
                  >
                    Profile Setup
                  </Text>
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
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-brandGreen/10 border border-brandGreen/20">
                  <View className="w-1.5 h-1.5 rounded-full bg-brandGreen" />
                  <Text
                    className="text-[11px] text-brandGreen uppercase"
                    style={{ fontFamily: FontFamily.headingSemiBold, letterSpacing: 0.6 }}
                  >
                    Step 3 of 4
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <View
                      key={i}
                      className="h-1.5 rounded-full"
                      style={{
                        width: 24,
                        backgroundColor: i < 3 ? Colors.brandGreen : 'rgba(231, 225, 216, 1)',
                      }}
                    />
                  ))}
                </View>
              </View>
            </View>

            <View className="w-full px-6 pt-3 pb-3">
              <Text
                className="text-[26px] text-textPrimary leading-[32px]"
                style={{ fontFamily: FontFamily.headingBold, letterSpacing: -0.3 }}
              >
                Set up your profile
              </Text>
              <Text
                className="text-[13.5px] leading-[20px] text-textSecondary mt-1"
                style={{ fontFamily: FontFamily.bodyMedium }}
              >
                Add your details to start booking verified cooperative artisans.
              </Text>
            </View>

            <View className="w-full items-center justify-center">
              <Pressable onPress={pickPhoto} disabled={uploading}>
                <View className="relative">
                  <View
                    className="w-24 h-24 rounded-full items-center justify-center overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(188, 238, 211, 0.40)',
                      shadowColor: '#1F4D3A',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.06,
                      shadowRadius: 8,
                    }}
                  >
                    {uploading ? (
                      <ActivityIndicator color={Colors.brandGreen} />
                    ) : photoUri ? (
                      <Image
                        source={{ uri: photoUri }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <Camera size={36} color={Colors.brandGreen} strokeWidth={1.8} />
                    )}
                  </View>
                  <View
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full items-center justify-center shadow-sm"
                    style={{
                      backgroundColor: Colors.brandGreen,
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                      shadowColor: '#023625',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                    }}
                  >
                    <Plus size={15} color="#FFFFFF" strokeWidth={2.6} />
                  </View>
                </View>
              </Pressable>
              <Pressable onPress={pickPhoto} disabled={uploading} hitSlop={8}>
                <View className="mt-2 flex-row items-center">
                  <Text
                    className="text-[12px] text-brandGreen"
                    style={{ fontFamily: FontFamily.bodySemiBold }}
                  >
                    Add photo
                  </Text>
                  <Text
                    className="text-[12px] ml-1 text-textSecondary"
                    style={{ fontFamily: FontFamily.bodyMedium }}
                  >
                    (Optional)
                  </Text>
                </View>
              </Pressable>
            </View>

            <View className="w-full px-6 pt-4" style={{ rowGap: 16 }}>
              <View style={{ rowGap: 6 }}>
                <Text
                  className="text-[14px] text-textPrimary"
                  style={{ fontFamily: FontFamily.headingBold }}
                >
                  Full Name
                </Text>
                <View
                  className="w-full rounded-xl bg-white items-center overflow-hidden"
                  style={{
                    shadowColor: '#023625',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 1,
                  }}
                >
                  <View className="w-full relative">
                    <View
                      pointerEvents="none"
                      className="absolute left-3.5 top-0 bottom-0 items-center justify-center"
                    >
                      <UserRound
                        size={22}
                        color={Colors.textSecondary}
                        opacity={0.7}
                        strokeWidth={2}
                      />
                    </View>
                    <Input
                      value={name}
                      onChangeText={setName}
                      placeholder="e.g. Ramesh Kumar"
                      style={{ paddingLeft: 44 }}
                    />
                  </View>
                </View>
                <Text
                  className="text-[12px] text-textSecondary px-1"
                  style={{ fontFamily: FontFamily.bodyMedium }}
                >
                  Used for appointment confirmations
                </Text>
              </View>

              <View
                className="w-full rounded-xl bg-white p-4 flex-row items-start gap-3"
                style={{
                  shadowColor: '#023625',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: 'rgba(188, 238, 211, 0.40)' }}
                >
                  <MapPin size={22} color={Colors.brandGreen} strokeWidth={2} />
                </View>
                <View className="flex-1 min-w-0 pr-1">
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="text-[17px] leading-[22px] text-textPrimary"
                      style={{ fontFamily: FontFamily.headingBold }}
                    >
                      Enable Location Access
                    </Text>
                    <View
                      className="relative inline-flex h-6 w-11 shrink-0 rounded-full items-center"
                      style={{ backgroundColor: Colors.brandGreen }}
                    >
                      <View
                        className="h-5 w-5 rounded-full bg-white"
                        style={{
                          marginLeft: 22,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.12,
                          shadowRadius: 2,
                          elevation: 2,
                        }}
                      />
                    </View>
                  </View>
                  <Text
                    className="text-[13px] leading-[19px] text-textSecondary mt-1.5"
                    style={{ fontFamily: FontFamily.bodyRegular }}
                  >
                    We use your location to connect you with nearby cooperative artisans within 5 km
                    and avoid dispatch delays.
                  </Text>
                </View>
              </View>

              <View
                className="flex-row items-center justify-between bg-background rounded-lg px-3 py-2"
                style={{
                  borderWidth: 1,
                  borderColor: 'rgba(231, 225, 216, 0.9)',
                }}
              >
                <View className="flex-row items-center gap-2">
                  <BadgeCheck size={16} color={Colors.brandGreen} strokeWidth={2.2} />
                  <Text
                    className="text-[12px] text-textPrimary"
                    style={{ fontFamily: FontFamily.headingSemiBold }}
                  >
                    Bylaw Range: Bangalore Central
                  </Text>
                </View>
                <Text
                  className="text-[12px] text-brandGreen"
                  style={{ fontFamily: FontFamily.headingSemiBold }}
                >
                  {'< 5 km'}
                </Text>
              </View>
            </View>

            <View className="w-full px-6 pt-4">
              <View
                className="w-full rounded-xl bg-white p-4 flex-row items-center gap-3"
                style={{
                  shadowColor: '#023625',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(188, 238, 211, 0.30)' }}
                >
                  <Handshake size={20} color={Colors.brandGreen} strokeWidth={2} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text
                    className="text-[14px] text-textPrimary"
                    style={{ fontFamily: FontFamily.headingSemiBold }}
                  >
                    100% Cooperative Owned
                  </Text>
                  <Text
                    className="text-[13px] text-textSecondary"
                    style={{ fontFamily: FontFamily.bodyRegular }}
                    numberOfLines={1}
                  >
                    Fair wages guaranteed for every artisan visit
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-auto w-full px-6 pt-4">
              <View className="relative w-full">
                <PrimaryButton
                  label="Finish"
                  onPress={handleSubmit}
                  disabled={!name.trim()}
                  loading={loading}
                />
                {!loading && name.trim() ? (
                  <View
                    pointerEvents="none"
                    className="absolute right-6 top-0 bottom-0 items-center justify-center"
                  >
                    <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.3} />
                  </View>
                ) : null}
              </View>
              <View className="flex-row items-center justify-center gap-1.5 mt-3 opacity-90">
                <Lock size={14} color={Colors.textPrimary} strokeWidth={2} opacity={0.75} />
                <Text
                  className="text-[11.5px] text-textPrimary"
                  style={{ fontFamily: FontFamily.bodyMedium, opacity: 0.8 }}
                >
                  Your privacy is protected under cooperative bylaws.
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingWrapper>
    </Screen>
  )
}
