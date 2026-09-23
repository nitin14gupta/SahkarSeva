import { Tabs } from 'expo-router'
import { Briefcase, HeartHandshake, IndianRupee, UserRound } from 'lucide-react-native'
import { Colors, FontFamily } from '@/constants'

export default function WorkerTabsLayout() {
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
        options={{ title: 'Jobs', tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="earnings"
        options={{ title: 'Earnings', tabBarIcon: ({ color, size }) => <IndianRupee color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="welfare"
        options={{ title: 'Welfare', tabBarIcon: ({ color, size }) => <HeartHandshake color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }}
      />
    </Tabs>
  )
}
