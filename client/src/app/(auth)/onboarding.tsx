import { useRef, useState } from 'react'
import {
  Dimensions, NativeScrollEvent, NativeSyntheticEvent,
  Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LogoMark, PrimaryButton } from '@/components/ui'
import { CacheKeys, Colors, FontFamily, Spacing } from '@/constants'

const { width } = Dimensions.get('window')

const SLIDES = [
  { title: 'Workers who own the platform.' },
  { title: 'Cooperative-verified, not algorithm-verified.' },
  { title: 'Welfare that follows you.' },
]

async function finishOnboarding() {
  await SecureStore.setItemAsync(CacheKeys.onboardingSeen, '1')
  router.replace('/(auth)/language')
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets()
  const [index, setIndex] = useState(0)
  const scrollRef = useRef<ScrollView>(null)

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(e.nativeEvent.contentOffset.x / width)
    if (next !== index) setIndex(next)
  }

  const isLast = index === SLIDES.length - 1

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <Pressable style={s.skip} onPress={finishOnboarding}>
        <Text style={s.skipText}>Skip</Text>
      </Pressable>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={s.slide}>
            <LogoMark size={64} style={s.logo} />
            <Text style={s.title}>{slide.title}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, i === index && s.dotActive]} />
        ))}
      </View>

      <View style={s.footer}>
        <PrimaryButton
          label={isLast ? 'Get Started' : 'Next'}
          onPress={() => {
            if (isLast) return finishOnboarding()
            scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true })
          }}
        />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skip: {
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.sm,
  },
  skipText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logo: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.divider,
  },
  dotActive: {
    backgroundColor: Colors.brandGreen,
    width: 20,
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.lg,
  },
})
