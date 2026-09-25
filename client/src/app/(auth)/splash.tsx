import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { ShieldCheck, Handshake } from 'lucide-react-native'
import { LogoMark } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { resolveWorkerRoute } from '@/utils/workerRouting'
import { CacheKeys, Colors, FontFamily } from '@/constants'

const MIN_DISPLAY_MS = 1000

export default function SplashScreen() {
  const { restoreSession } = useAuth()
  const insets = useSafeAreaInsets()

  const pulseScale = useSharedValue(1)
  const pulseOpacity = useSharedValue(0.9)

  useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.28, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    )
    pulseOpacity.value = withRepeat(
      withTiming(0.35, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    )
  }, [pulseScale, pulseOpacity])

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }))

  useEffect(() => {
    let cancelled = false

    async function boot() {
      const [user] = await Promise.all([
        restoreSession(),
        new Promise((resolve) => setTimeout(resolve, MIN_DISPLAY_MS)),
      ])
      if (cancelled) return

      if (user) {
        if (user.role === 'customer') return router.replace('/(customer)/(tabs)/home')
        if (user.role === 'worker') return router.replace(await resolveWorkerRoute())
        return router.replace('/role')
      }

      const onboardingSeen = await SecureStore.getItemAsync(CacheKeys.onboardingSeen)
      router.replace(onboardingSeen ? '/language' : '/onboarding')
    }

    boot()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{
        backgroundColor: Colors.brandGreen,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: '38%',
              left: '50%',
              width: 260,
              height: 260,
              marginLeft: -130,
              marginTop: -130,
              borderRadius: 130,
              backgroundColor: 'rgba(212, 160, 23, 0.16)',
            },
            pulseStyle,
          ]}
        />
        <View
          style={{
            position: 'absolute',
            top: -80,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: 120,
            backgroundColor: 'rgba(192, 91, 65, 0.08)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: -100,
            left: -50,
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
          }}
        />
      </View>

      <View className="flex-1 w-full items-center justify-center px-8">
        <View className="items-center justify-center">
          <View className="relative mb-7">
            <View className="w-[112px] h-[112px] rounded-full bg-gold items-center justify-center p-1.5"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.22,
                shadowRadius: 18,
                elevation: 8,
              }}
            >
              <View className="w-full h-full rounded-full bg-white items-center justify-center overflow-hidden p-2">
                <LogoMark size={58} />
              </View>
            </View>

            <View
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full items-center justify-center border-[2px] border-[#1F4D3A]"
              style={{ backgroundColor: '#023625' }}
            >
              <Handshake size={15} color={Colors.gold} strokeWidth={2.2} />
            </View>
          </View>

          <View className="items-center">
            <Text
              className="text-[28px] text-white leading-[34px]"
              style={{
                fontFamily: FontFamily.headingExtraBold,
                letterSpacing: -0.5,
              }}
            >
              SahkarSeva
            </Text>
            <View className="mt-1.5 flex-row items-center gap-1.5">
              <View className="w-1 h-1 rounded-full bg-gold" />
              <Text
                className="text-[11px] uppercase text-[#D9C9A6]"
                style={{
                  fontFamily: FontFamily.headingSemiBold,
                  letterSpacing: 2.2,
                }}
              >
                Workers who own the platform
              </Text>
              <View className="w-1 h-1 rounded-full bg-gold" />
            </View>
          </View>

          <View className="mt-9 flex-row items-center gap-2">
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'rgba(188, 237, 211, 0.95)' }}
            >
              <Animated.View
                style={[
                  {
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#BCEED3',
                  },
                  pulseStyle,
                ]}
              />
            </View>
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'rgba(188, 237, 211, 0.9)' }}
            />
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'rgba(188, 237, 211, 0.4)' }}
            />
          </View>
        </View>
      </View>

      <View className="w-full items-center justify-center py-4">
        <View className="flex-row items-center gap-1.5">
          <ShieldCheck size={13} color="#D9C9A6" strokeWidth={2.2} />
          <Text
            className="text-[10.5px] uppercase text-[#D9C9A6]"
            style={{
              fontFamily: FontFamily.headingSemiBold,
              letterSpacing: 1.6,
            }}
          >
            100% Cooperative Owned
          </Text>
        </View>
      </View>
    </View>
  )
}
