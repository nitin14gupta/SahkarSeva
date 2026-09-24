import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { LogoMark } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { resolveWorkerRoute } from '@/utils/workerRouting'
import { CacheKeys, Colors } from '@/constants'

const MIN_DISPLAY_MS = 1000

export default function SplashScreen() {
  const { restoreSession } = useAuth()

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
    return () => { cancelled = true }
  }, [])

  return (
    <View style={s.container}>
      <View style={s.badge}>
        <LogoMark size={56} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brandGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
