import { Tabs } from 'expo-router'
import { Briefcase, HeartHandshake, IndianRupee, UserRound } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { Colors, FontFamily } from '@/constants'

export default function WorkerTabsLayout() {
  const { t } = useTranslation('worker')
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.brandGreen,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: { fontFamily: FontFamily.bodyMedium, fontSize: 11 },
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.divider },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: t('tabs.jobs'), tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="earnings"
        options={{ title: t('tabs.earnings'), tabBarIcon: ({ color, size }) => <IndianRupee color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="welfare"
        options={{ title: t('tabs.welfare'), tabBarIcon: ({ color, size }) => <HeartHandshake color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('tabs.profile'), tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }}
      />
    </Tabs>
  )
}
