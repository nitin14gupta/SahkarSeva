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
  TextInput,
  Pressable,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { G, Path, Circle } from 'react-native-svg'
import {
  Check,
  ArrowRight,
  Shield,
  Lock,
  Handshake,
  HeartHandshake,
  BadgeCheck,
  ChevronDown,
  X,
} from 'lucide-react-native'
import { LogoMark, BackButton, KeyboardAvoidingWrapper } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { Colors, FontFamily, Spacing } from '@/constants'

export default function PhoneScreen() {
  const [phone, setPhone] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(true)
  const [isFocused, setIsFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { handleSendOTP } = useAuth()
  const insets = useSafeAreaInsets()

  const isValid = phone.length === 10
  const canSubmit = isValid && termsAccepted && !loading

  // Animated blob shared values — two blobs breathe at slightly different rhythms
  const blob1Scale = useSharedValue(1)
  const blob2Scale = useSharedValue(1)

  useEffect(() => {
    blob1Scale.value = withRepeat(
      withTiming(1.22, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    )
    blob2Scale.value = withRepeat(
      withTiming(1.18, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
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
    if (digits.length > 5) {
      return `${digits.slice(0, 5)} ${digits.slice(5)}`
    }
    return digits
  }

  const handlePhoneChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, 10)
    setPhone(clean)
    if (error) setError('')
  }

  const handleContinue = async () => {
    if (!isValid) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    if (!termsAccepted) {
      setError('Please agree to the Terms and Conditions to proceed')
      return
    }
    if (loading) return

    Keyboard.dismiss()
    setLoading(true)
    setError('')
    try {
      await handleSendOTP(phone)
      router.push({ pathname: '/otp', params: { phone } })
    } catch (e: any) {
      setError(e?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient
      colors={['#E8F5E9', '#E8F5E9', '#FAF8F5', '#FAF8F5']}
      locations={[0, 0.38, 0.58, 1]}
      style={{ flex: 1 }}
    >
      {/* Decorative Woven Geometric Arch Pattern & Ambient Glows */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: -40,
              left: -40,
              width: 240,
              height: 240,
              borderRadius: 120,
              backgroundColor: 'rgba(31, 77, 58, 0.07)',
            },
            blob1Style,
          ]}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 20,
              right: -50,
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: 'rgba(72, 180, 97, 0.08)',
            },
            blob2Style,
          ]}
        />
        <Svg
          width="100%"
          height={280}
          viewBox="0 0 390 320"
          style={{ opacity: 0.2 }}
          preserveAspectRatio="none"
        >
          <G
            opacity={0.65}
            stroke="#1F4D3A"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.2}
          >
            <Path
              d="M-40 180 C40 120, 110 40, 195 40 C280 40, 350 120, 430 180"
              strokeDasharray="3,3"
            />
            <Path d="M-20 210 C60 150, 125 70, 195 70 C265 70, 330 150, 410 210" />
            <Path
              d="M0 240 C80 180, 140 100, 195 100 C250 100, 310 180, 390 240"
              strokeDasharray="2,4"
            />
            <Path d="M195 10 V 160" />
            <Path
              d="M195 50 C215 35, 235 45, 240 60 C220 65, 205 60, 195 50 Z"
              fill="#1F4D3A"
              fillOpacity={0.08}
            />
            <Path
              d="M195 90 C175 75, 155 85, 150 100 C170 105, 185 100, 195 90 Z"
              fill="#1F4D3A"
              fillOpacity={0.08}
            />
            <Path
              d="M195 130 C215 115, 235 125, 240 140 C220 145, 205 140, 195 130 Z"
              fill="#1F4D3A"
              fillOpacity={0.08}
            />
          </G>
          <G opacity={0.75} stroke="#D4A359" strokeWidth={1}>
            <Circle cx={195} cy={40} r={14} strokeDasharray="2,3" />
            <Circle cx={195} cy={40} fill="#D4A359" fillOpacity={0.25} r={4} />
            <Circle cx={110} cy={110} r={28} strokeDasharray="4,4" />
            <Circle cx={280} cy={110} r={28} strokeDasharray="4,4" />
            <Path
              d="M100 110 Q 110 100 120 110 Q 110 120 100 110 Z"
              fill="#D4A359"
              fillOpacity={0.15}
            />
            <Path
              d="M270 110 Q 280 100 290 110 Q 280 120 270 110 Z"
              fill="#D4A359"
              fillOpacity={0.15}
            />
          </G>
        </Svg>
      </View>

      {/* Back button (if available in navigation stack) */}
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

      <KeyboardAvoidingWrapper transparent>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: Spacing.screenPadding,
            paddingTop: Math.max(insets.top, 10) + 8,
            paddingBottom: Math.max(insets.bottom, 12) + 12,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Mark & Cooperative Identity Header */}
          <View className="items-center pt-1 pb-3">
            <View className="relative mb-2.5 items-center justify-center">
              {/* Subtle halo glow */}
              <View
                style={{
                  position: 'absolute',
                  width: 82,
                  height: 82,
                  borderRadius: 26,
                  backgroundColor: 'rgba(212, 160, 23, 0.15)',
                }}
              />
              <View
                className="w-[70px] h-[70px] rounded-[20px] bg-white items-center justify-center border border-divider"
                style={{
                  shadowColor: '#1E1A16',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.05,
                  shadowRadius: 12,
                  elevation: 2,
                }}
              >
                <LogoMark size={45} />
                <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brandGreen items-center justify-center border-2 border-background">
                  <Check size={10} color="#FFFFFF" strokeWidth={3} />
                </View>
              </View>
            </View>

            <View className="flex-row items-center gap-1.5 mb-1.5">
              <Text
                className="text-[20px] text-brandGreen tracking-tight"
                style={{ fontFamily: FontFamily.headingBold }}
              >
                SahkarSeva
              </Text>
              <View className="w-1.5 h-1.5 rounded-full bg-terracotta mx-0.5" />
              <Text
                className="text-[10.5px] uppercase text-terracotta"
                style={{ fontFamily: FontFamily.headingSemiBold, letterSpacing: 1.2 }}
              >
                CO-OP
              </Text>
            </View>

            {/* Artisanal Pill Badge */}
            <View className="flex-row items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/90 border border-divider">
              <Handshake size={13} color={Colors.brandGreen} />
              <Text
                className="text-[10px] uppercase text-brandGreen"
                style={{ fontFamily: FontFamily.headingSemiBold, letterSpacing: 0.8 }}
              >
                100% Worker-Owned Cooperative
              </Text>
            </View>
          </View>

          {/* Heading */}
          <View className="mb-4 text-left">
            <Text
              className="text-[30px] text-textPrimary leading-[36px]"
              style={{ fontFamily: FontFamily.headingBold, letterSpacing: -0.5 }}
            >
              Enter your{'\n'}
              <Text
                className="text-brandGreen"
                style={{ fontFamily: FontFamily.headingExtraBold }}
              >
                phone number
              </Text>
            </Text>
            <Text
              className="text-[13.5px] leading-[19px] mt-1.5"
              style={{ fontFamily: FontFamily.bodyRegular, color: Colors.textSecondary }}
            >
              We will send you a one-time code to authenticate your member access
            </Text>
          </View>

          {/* Phone Input Field Module */}
          <View className="mb-3.5">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text
                className="text-[13px] text-textPrimary tracking-wide"
                style={{ fontFamily: FontFamily.headingSemiBold }}
              >
                Mobile Number
              </Text>
              <View className="flex-row items-center gap-1.5">
                <View className="w-1.5 h-1.5 rounded-full bg-[#128807]" />
                <Text
                  className="text-[12px]"
                  style={{ fontFamily: FontFamily.bodyRegular, color: Colors.textSecondary }}
                >
                  India (+91)
                </Text>
              </View>
            </View>

            <View
              className={`flex-row items-center bg-white rounded-2xl p-1.5 border ${
                error
                  ? 'border-destructive'
                  : isFocused
                  ? 'border-brandGreen'
                  : 'border-divider'
              }`}
              style={{
                shadowColor: '#1E1A16',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 1,
              }}
            >
              {/* Country Code Selector Pill */}
              <View className="flex-row items-center gap-1.5 px-2.5 py-2 rounded-xl bg-background border border-divider">
                {/* Indian Tricolor Flag */}
                <View
                  style={{
                    width: 18,
                    height: 12,
                    borderRadius: 2,
                    overflow: 'hidden',
                    borderWidth: 0.5,
                    borderColor: 'rgba(0,0,0,0.15)',
                  }}
                >
                  <View style={{ height: 4, backgroundColor: '#FF9933', width: '100%' }} />
                  <View
                    style={{
                      height: 4,
                      backgroundColor: '#FFFFFF',
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <View
                      style={{
                        width: 2.5,
                        height: 2.5,
                        borderRadius: 1.25,
                        backgroundColor: '#000080',
                      }}
                    />
                  </View>
                  <View style={{ height: 4, backgroundColor: '#128807', width: '100%' }} />
                </View>
                <Text
                  className="text-[14.5px] text-textPrimary"
                  style={{ fontFamily: FontFamily.headingBold }}
                >
                  +91
                </Text>
                <ChevronDown size={14} color={Colors.textSecondary} />
              </View>

              {/* Number Input */}
              <TextInput
                value={formatDisplayPhone(phone)}
                onChangeText={handlePhoneChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType="number-pad"
                maxLength={11}
                placeholder="••••• •••••"
                placeholderTextColor="rgba(110, 100, 89, 0.38)"
                autoFocus
                className="flex-1 ml-2.5 mr-1 text-[20px] text-textPrimary py-1"
                style={{ fontFamily: FontFamily.headingBold, letterSpacing: 1.5 }}
              />

              {phone.length > 0 && (
                <Pressable
                  onPress={() => {
                    setPhone('')
                    setError('')
                  }}
                  hitSlop={8}
                  className="p-1.5 rounded-full bg-background mr-1"
                >
                  <X size={14} color={Colors.textSecondary} />
                </Pressable>
              )}
            </View>

            {/* Error Message */}
            {!!error && (
              <Text
                className="text-[12px] text-destructive mt-1 px-1"
                style={{ fontFamily: FontFamily.bodyRegular }}
              >
                {error}
              </Text>
            )}

            {/* Micro-assurance */}
            <View className="flex-row items-center gap-1.5 mt-1.5 px-1">
              <Lock size={12} color={Colors.brandGreen} />
              <Text
                className="text-[12px]"
                style={{ fontFamily: FontFamily.bodyRegular, color: Colors.textSecondary }}
              >
                Secure login via SMS. No spam, ever.
              </Text>
            </View>
          </View>

          {/* Cooperative Difference Value Card */}
          <View
            className="flex-row items-start gap-3 p-3.5 rounded-2xl bg-white border border-divider mb-3.5"
            style={{
              shadowColor: '#1E1A16',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.03,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <View className="w-9 h-9 rounded-xl bg-brandGreen items-center justify-center shrink-0">
              <HeartHandshake size={19} color="#FFFFFF" />
            </View>
            <View className="flex-1 min-w-0">
              <View className="flex-row items-center gap-2 mb-0.5 flex-wrap">
                <Text
                  className="text-[13px] text-brandGreen"
                  style={{ fontFamily: FontFamily.headingBold }}
                >
                  Direct Fair-Earnings
                </Text>
                <View className="px-2 py-0.5 rounded-md bg-terracotta/10 border border-terracotta/20">
                  <Text
                    className="text-[9.5px] uppercase text-terracotta"
                    style={{ fontFamily: FontFamily.headingBold, letterSpacing: 0.8 }}
                  >
                    0% Platform Skim
                  </Text>
                </View>
              </View>
              <Text
                className="text-[12px] leading-[17px]"
                style={{ fontFamily: FontFamily.bodyRegular, color: Colors.textSecondary }}
              >
                100% of service billing goes directly to verified local electricians, carpenters & plumbers.
              </Text>
            </View>
          </View>

          {/* Interactive Agreement Checkbox */}
          <Pressable
            onPress={() => setTermsAccepted(!termsAccepted)}
            className="flex-row items-start gap-2.5 mb-4 px-0.5"
            hitSlop={6}
          >
            <View
              className={`w-4.5 h-4.5 rounded-[5px] border items-center justify-center mt-0.5 ${
                termsAccepted
                  ? 'bg-brandGreen border-brandGreen'
                  : 'bg-white border-divider'
              }`}
            >
              {termsAccepted && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
            </View>
            <Text
              className="flex-1 text-[12px] leading-[17px]"
              style={{ fontFamily: FontFamily.bodyRegular, color: Colors.textSecondary }}
            >
              I agree to the{' '}
              <Text
                className="underline"
                style={{ fontFamily: FontFamily.headingSemiBold, color: Colors.brandGreen }}
              >
                Terms and Conditions
              </Text>
              {' '}and{' '}
              <Text
                className="underline"
                style={{ fontFamily: FontFamily.headingSemiBold, color: Colors.brandGreen }}
              >
                Privacy Policy
              </Text>.
            </Text>
          </Pressable>

          {/* Bottom Action CTA Area */}
          <View className="pt-0.5">
            <Pressable
              onPress={handleContinue}
              disabled={!canSubmit}
              className={`w-full h-[50px] rounded-2xl items-center justify-center flex-row gap-2.5 overflow-hidden ${
                canSubmit ? 'bg-terracotta' : 'bg-terracotta/40'
              }`}
              style={
                canSubmit
                  ? {
                      shadowColor: '#C05B41',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.32,
                      shadowRadius: 10,
                      elevation: 3,
                    }
                  : undefined
              }
            >
              {loading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text
                    className="text-white text-[15.5px]"
                    style={{ fontFamily: FontFamily.headingBold, letterSpacing: 0.3 }}
                  >
                    Sending OTP...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-2">
                  <Text
                    className="text-white text-[15.5px]"
                    style={{ fontFamily: FontFamily.headingBold, letterSpacing: 0.4 }}
                  >
                    Send Verification OTP
                  </Text>
                  <ArrowRight size={17} color="#FFFFFF" strokeWidth={2.5} />
                </View>
              )}
            </Pressable>

            {/* Cooperative Member Charter Micro-text */}
            <View className="flex-row items-center justify-center gap-1.5 py-1.5 mt-0.5">
              <Shield size={12} color={Colors.brandGreen} />
              <Text
                className="text-[11.5px]"
                style={{ fontFamily: FontFamily.bodyRegular, color: Colors.textSecondary }}
              >
                Protected under Cooperative Member Charter
              </Text>
            </View>
          </View>

          {/* Community Proof Widget */}
          <View className="mt-2.5 flex-row items-center justify-between px-3 py-2 bg-white/90 rounded-2xl border border-divider">
            <View className="flex-row items-center gap-2.5">
              <View className="flex-row">
                <View className="w-6 h-6 rounded-full bg-brandGreen items-center justify-center border-2 border-white">
                  <Text className="text-[9px] text-white" style={{ fontFamily: FontFamily.headingBold }}>
                    MK
                  </Text>
                </View>
                <View className="w-6 h-6 rounded-full bg-terracotta items-center justify-center border-2 border-white -ml-2">
                  <Text className="text-[9px] text-white" style={{ fontFamily: FontFamily.headingBold }}>
                    RS
                  </Text>
                </View>
                <View className="w-6 h-6 rounded-full bg-[#352D24] items-center justify-center border-2 border-white -ml-2">
                  <Text className="text-[9px] text-white" style={{ fontFamily: FontFamily.headingBold }}>
                    AP
                  </Text>
                </View>
              </View>
              <View>
                <View className="flex-row items-center gap-1">
                  <Text
                    className="text-[12.5px] text-textPrimary tracking-tight"
                    style={{ fontFamily: FontFamily.headingBold }}
                  >
                    3,420+ Member Artisans
                  </Text>
                  <BadgeCheck size={12} color="#128807" />
                </View>
                <Text
                  className="text-[11px]"
                  style={{ fontFamily: FontFamily.bodyRegular, color: Colors.textSecondary }}
                >
                  Serving your local neighborhood
                </Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-[#128807]/10 border border-[#128807]/20">
              <View className="w-1.5 h-1.5 rounded-full bg-[#128807]" />
              <Text
                className="text-[10px] uppercase text-[#128807]"
                style={{ fontFamily: FontFamily.headingSemiBold, letterSpacing: 0.8 }}
              >
                Active
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingWrapper>
    </LinearGradient>
  )
}
