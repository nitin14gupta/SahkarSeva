import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { UserRound, Wrench } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PrimaryButton, RoleCard } from '@/components/ui'
import { Colors, FontFamily, Spacing } from '@/constants'
import type { Role } from '@/types/auth'

export default function RoleScreen() {
  const insets = useSafeAreaInsets()
  const [role, setRole] = useState<Role | null>(null)

  function handleContinue() {
    if (!role) return
    router.push({ pathname: '/(auth)/phone', params: { role } })
  }

  return (
    <View style={[s.container, { paddingTop: insets.top + Spacing.xl }]}>
      <View style={s.header}>
        <Text style={s.title}>How will you use SahkarSeva?</Text>
        <Text style={s.subtitle}>You can&apos;t switch this later without contacting support</Text>
      </View>

      <View style={s.row}>
        <RoleCard
          icon={UserRound}
          title="I need a service"
          subtitle="Book verified workers"
          selected={role === 'customer'}
          onPress={() => setRole('customer')}
        />
        <RoleCard
          icon={Wrench}
          title="I provide a service"
          subtitle="Find work, get paid, get covered"
          selected={role === 'worker'}
          onPress={() => setRole('worker')}
        />
      </View>

      <View style={s.footer}>
        <PrimaryButton label="Continue" onPress={handleContinue} disabled={!role} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screenPadding,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 26,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: Spacing.lg,
  },
})
