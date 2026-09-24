import { useCallback, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Bell } from 'lucide-react-native'
import { Colors } from '@/constants'
import * as apiService from '@/api/apiService'
import { HeaderIconBtn } from './AppHeader'

export function NotificationBell() {
  const [count, setCount] = useState(0)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        try {
          const { count } = await apiService.getUnreadNotificationCount()
          if (!cancelled) setCount(count)
        } catch {
          // non-critical — the badge just won't update
        }
      })()
      return () => { cancelled = true }
    }, [])
  )

  return (
    <HeaderIconBtn onPress={() => router.push('/notifications')}>
      <View>
        <Bell size={20} color={Colors.textPrimary} strokeWidth={2} />
        {count > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{count > 9 ? '9+' : count}</Text>
          </View>
        )}
      </View>
    </HeaderIconBtn>
  )
}

const s = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: Colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.inkOnAccent,
  },
})
