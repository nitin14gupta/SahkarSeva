import { ReactNode } from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import ReanimatedView, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChevronLeft } from 'lucide-react-native'
import { router } from 'expo-router'
import { APP_NAME, Colors, FontFamily } from '@/constants'
import { LogoMark } from './LogoMark'

export const APP_HEADER_BAR_HEIGHT = 52

interface AppHeaderProps {
  /** Shows the SahkarSeva wordmark + logo instead of a title — for top-level tab screens. */
  showLogo?: boolean
  title?: string
  /** Replaces the title text with arbitrary content (e.g. a search bar), still centered. */
  centerContent?: ReactNode
  /** Convenience: renders a back-chevron HeaderIconBtn that calls router.back(). Ignored if leftAction is given. */
  showBack?: boolean
  leftAction?: ReactNode
  rightAction?: ReactNode
  transparent?: boolean
  /** Animated.Value (0→1) that fades + slides the header out — for a header that
   * hides on scroll. Omit for a normal static header. */
  hideProgress?: Animated.Value
}

export function AppHeader({
  showLogo = false,
  title,
  centerContent,
  showBack = false,
  leftAction,
  rightAction,
  transparent = false,
  hideProgress,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets()
  const totalHeight = APP_HEADER_BAR_HEIGHT + insets.top

  const floatingStyle = hideProgress && {
    opacity: hideProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
    transform: [
      {
        translateY: hideProgress.interpolate({ inputRange: [0, 1], outputRange: [0, -totalHeight] }),
      },
    ],
  }

  const left = leftAction ?? (showBack ? (
    <HeaderIconBtn onPress={() => router.back()}>
      <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
    </HeaderIconBtn>
  ) : <View />)

  return (
    <Animated.View
      style={[
        s.root,
        transparent && s.rootTransparent,
        { paddingTop: insets.top },
        hideProgress && s.rootFloating,
        floatingStyle,
      ]}
      pointerEvents={hideProgress ? 'box-none' : 'auto'}
    >
      <View style={s.bar}>
        <View style={s.side}>
          {showLogo ? <LogoMark size={22} style={s.sideLogo} /> : left}
        </View>

        <View style={s.center}>
          {showLogo ? (
            <Text style={s.logo}>{APP_NAME}</Text>
          ) : centerContent ? (
            centerContent
          ) : title ? (
            <Text style={s.title} numberOfLines={1}>{title}</Text>
          ) : null}
        </View>

        <View style={[s.side, s.sideRight]}>{rightAction ?? <View />}</View>
      </View>
    </Animated.View>
  )
}

const AnimatedPressable = ReanimatedView.createAnimatedComponent(Pressable)

export function HeaderIconBtn({
  children,
  onPress,
  disableAnimation = false,
}: {
  children: ReactNode
  onPress?: () => void
  /** Opt out of the press-scale spring for an icon that should feel static. */
  disableAnimation?: boolean
}) {
  const pressScale = useSharedValue(1)
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: pressScale.value }] }))

  if (disableAnimation) {
    return (
      <Pressable onPress={onPress} hitSlop={10} style={s.iconBtn}>
        {children}
      </Pressable>
    )
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      hitSlop={10}
      style={[s.iconBtn, pressStyle]}
      // eslint-disable-next-line react-hooks/immutability -- Reanimated SharedValue.value assignment is the sanctioned mutation API, not a purity violation
      onPressIn={() => { pressScale.value = withSpring(0.9, { duration: 120 }) }}
      // eslint-disable-next-line react-hooks/immutability -- see above
      onPressOut={() => { pressScale.value = withSpring(1, { duration: 120 }) }}
    >
      {children}
    </AnimatedPressable>
  )
}

const s = StyleSheet.create({
  root: {
    backgroundColor: Colors.background,
    zIndex: 10,
  },
  rootTransparent: {
    backgroundColor: 'transparent',
  },
  rootFloating: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bar: {
    height: APP_HEADER_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  // Fixed (not min) width, equal on both sides — the center column is only
  // truly centered on screen when both flanking columns are the same width,
  // regardless of how much content either one actually holds.
  side: {
    width: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  sideLogo: {
    marginLeft: 6,
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontFamily: FontFamily.headingBold,
    fontSize: 20,
    color: Colors.brandGreen,
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 17,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
