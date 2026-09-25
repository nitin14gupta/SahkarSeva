import React, { useState, useEffect } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { G, Path, Circle } from 'react-native-svg'
import {
  Pencil,
  Shield,
  Lock,
  Handshake,
  BadgeCheck,
} from 'lucide-react-native'
import {
  OTPInput,
  PrimaryButton,
  KeyboardAvoidingWrapper,
  LogoMark,
  BackButton,
} from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useCountdown } from '@/hooks/useCountdown'
import { resolveWorkerRoute } from '@/utils/workerRouting'
import { Colors, FontFamily, Spacing } from '@/constants'

export default function OTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>()
  const insets = useSafeAreaInsets()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [attempts, setAttempts] = useState(0)
  const tooManyAttempts = attempts >= 3
  const { handleVerifyOTP, handleSendOTP } = useAuth()
  const { seconds, isExpired, reset } = useCountdown(45)

  const isComplete = code.length === 6

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

  const formatDisplayPhone = (digits: string) => {
    if (!digits) return ''
    if (digits.length > 5) {
      return `${digits.slice(0, 5)} ${digits.slice(5)}`
    }
    return digits
  }

  const handleVerify = async (codeToVerify: string) => {
    if (codeToVerify.length !== 6 || tooManyAttempts) return
    setLoading(true)
    setError(false)
    setErrorMsg('')
    try {
      const user = await handleVerifyOTP(phone, codeToVerify)
      if (user.role === 'customer') {
        router.replace('/(customer)/(tabs)/home')
      } else if (user.role === 'worker') {
        router.replace(await resolveWorkerRoute())
      } else {
        router.push('/role')
      }
    } catch (e: any) {
      const next = attempts + 1
      setAttempts(next)
      setError(true)
      setErrorMsg(
        next >= 3
          ? 'Too many attempts — request a new code.'
          : e?.message || 'Incorrect code. Try again.',
      )
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeCode = (next: string) => {
    setCode(next)
    if (next.length === 6 && !loading && !tooManyAttempts)
      handleVerify(next)
  }

  const handleResend = async () => {
    try {
      await handleSendOTP(phone)
      reset()
      setAttempts(0)
      setError(false)
      setErrorMsg('')
    } catch (e: any) {
      setError(true)
      setErrorMsg(e?.message || 'Failed to resend code. Try again.')
    }
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
          style={{ opacity: 0.18 }}
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
            <Path
              d="M195 40 C215 25, 235 35, 240 50 C220 55, 205 50, 195 40 Z"
              fill="#1F4D3A"
              fillOpacity={0.07}
            />
            <Path
              d="M195 75 C175 60, 155 70, 150 85 C170 90, 185 85, 195 75 Z"
              fill="#1F4D3A"
              fillOpacity={0.07}
            />
            <Path
              d="M195 110 C215 95, 235 105, 240 120 C220 125, 205 120, 195 110 Z"
              fill="#1F4D3A"
              fillOpacity={0.07}
            />
          </G>
          <G opacity={0.6} stroke="#D4A359" strokeWidth={1}>
            <Circle cx={195} cy={30} r={12} strokeDasharray="2,3" />
            <Circle cx={195} cy={30} fill="#D4A359" fillOpacity={0.22} r={3.5} />
            <Circle cx={110} cy={100} r={24} strokeDasharray="4,4" />
            <Circle cx={280} cy={100} r={24} strokeDasharray="4,4" />
          </G>
        </Svg>
      </View>

      {router.canGoBack() && (
        <View
          style={{
            position: 'absolute',
            top: Math.max(insets.top, 10),
            left: 16,
            zIndex: 30,
          }}
        >
          <BackButton onPress={() => router.back()} transparent />
        </View>
      )}

      <View
        style={{
          position: 'absolute',
          top: Math.max(insets.top, 10),
          right: 16,
          zIndex: 30,
        }}
        className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/90 border border-divider"
      >
        <LogoMark size={18} />
        <Text
          className="text-[12px] text-brandGreen"
          style={{ fontFamily: FontFamily.headingBold, letterSpacing: 0.2 }}
        >
          SahkarSeva
        </Text>
      </View>

      <KeyboardAvoidingWrapper transparent>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: Spacing.screenPadding,
            paddingTop: Math.max(insets.top, 10) + 62,
            paddingBottom: Math.max(insets.bottom, 16) + 16,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-5">
            <View className="relative mb-3 items-center justify-center">
              <View
                style={{
                  position: 'absolute',
                  width: 72,
                  height: 72,
                  borderRadius: 22,
                  backgroundColor: 'rgba(31, 77, 58, 0.12)',
                }}
              />
              <View
                className="w-[60px] h-[60px] rounded-[18px] bg-white items-center justify-center border border-divider"
                style={{
                  shadowColor: '#1E1A16',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  elevation: 2,
                }}
              >
                <Shield size={28} color={Colors.brandGreen} strokeWidth={2.2} />
              </View>
            </View>

            <Text
              className="text-[26px] text-textPrimary leading-[32px] text-center"
              style={{
                fontFamily: FontFamily.headingBold,
                letterSpacing: -0.4,
              }}
            >
              Verify your number
            </Text>

            <View className="mt-2 flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-divider">
              <Text
                className="text-[13px]"
                style={{
                  fontFamily: FontFamily.bodyRegular,
                  color: Colors.textSecondary,
                }}
              >
                Code sent to{' '}
                <Text
                  className="text-[13px] text-textPrimary"
                  style={{ fontFamily: FontFamily.headingSemiBold }}
                >
                  +91 {formatDisplayPhone(phone || '')}
                </Text>
              </Text>
              <Pressable onPress={() => router.back()} hitSlop={6}>
                <View className="flex-row items-center gap-0.5">
                  <Text
                    className="text-[12px] text-terracotta"
                    style={{ fontFamily: FontFamily.headingSemiBold }}
                  >
                    Edit
                  </Text>
                  <Pencil
                    size={12}
                    color={Colors.terracotta}
                    strokeWidth={2.2}
                  />
                </View>
              </Pressable>
            </View>
          </View>

          <View className="items-center mb-3">
            <Text
              className="text-[11px] uppercase text-textSecondary tracking-wider mb-2.5"
              style={{ fontFamily: FontFamily.headingSemiBold, letterSpacing: 1.4 }}
            >
              Enter 6-digit one-time code
            </Text>
            <OTPInput
              value={code}
              onChange={handleChangeCode}
              error={error}
              autoFocus
            />
          </View>

          {errorMsg ? (
            <View className="items-center mb-2">
              <Text
                className="text-[12.5px] text-destructive text-center"
                style={{ fontFamily: FontFamily.bodyMedium }}
              >
                {errorMsg}
              </Text>
            </View>
          ) : null}

          <View className="items-center mb-5 mt-1">
            {!isExpired && !tooManyAttempts ? (
              <View className="flex-row items-center gap-1.5 bg-white/90 px-3.5 py-1.5 rounded-full border border-divider">
                <BadgeCheck size={14} color={Colors.terracotta} />
                <Text
                  className="text-[12.5px]"
                  style={{
                    fontFamily: FontFamily.bodyRegular,
                    color: Colors.textSecondary,
                  }}
                >
                  Resend code in{' '}
                  <Text
                    className="text-[12.5px] text-textPrimary"
                    style={{ fontFamily: FontFamily.headingBold }}
                  >
                    0:{String(seconds).padStart(2, '0')}
                  </Text>
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={handleResend}
                className="flex-row items-center gap-1.5 bg-white/90 px-3.5 py-1.5 rounded-full border border-divider"
                hitSlop={6}
              >
                <Lock size={13} color={Colors.brandGreen} />
                <Text
                  className="text-[13px] text-brandGreen"
                  style={{ fontFamily: FontFamily.headingSemiBold }}
                >
                  Resend code
                </Text>
              </Pressable>
            )}
          </View>

          <View className="mt-auto pt-2">
            <PrimaryButton
              label="Verify & Continue"
              onPress={() => handleVerify(code)}
              disabled={!isComplete || tooManyAttempts}
              loading={loading}
            />

            <View className="flex-row items-center justify-center gap-1.5 py-2.5 mt-1">
              <Handshake size={13} color={Colors.brandGreen} />
              <Text
                className="text-[11.5px]"
                style={{
                  fontFamily: FontFamily.bodyRegular,
                  color: Colors.textSecondary,
                }}
              >
                Protected under SahkarSeva Member Charter
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingWrapper>
    </LinearGradient>
  )
}
