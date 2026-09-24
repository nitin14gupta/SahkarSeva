import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { Bell } from 'lucide-react-native'
import { AppHeader, EmptyState } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { AppNotification } from '@/types/notification'

export default function CustomerNotificationsScreen() {
  const show = usePillStore((s) => s.show)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        setLoading(true)
        try {
          const { notifications } = await apiService.getNotifications()
          if (!cancelled) setNotifications(notifications)
        } catch {
          if (!cancelled) show('Could not load notifications', 'error')
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => { cancelled = true }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- `show` is a stable zustand setter
    }, [])
  )

  async function handlePress(notification: AppNotification) {
    if (notification.is_read) return
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)))
    try {
      await apiService.markNotificationRead(notification.id)
    } catch {
      // best-effort — don't roll back over a read-state failure
    }
  }

  return (
    <View style={s.container}>
      <AppHeader title="Notifications" showBack />
      {loading ? (
        <View style={s.center}><ActivityIndicator color={Colors.brandGreen} /></View>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" />
      ) : (
        <ScrollView contentContainerStyle={s.content}>
          {notifications.map((n) => (
            <Pressable key={n.id} style={[s.item, !n.is_read && s.itemUnread]} onPress={() => handlePress(n)}>
              {!n.is_read && <View style={s.dot} />}
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{n.title}</Text>
                {!!n.body && <Text style={s.body}>{n.body}</Text>}
                <Text style={s.timestamp}>
                  {new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  item: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: Spacing.sm,
  },
  itemUnread: {
    borderColor: Colors.brandGreen,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brandGreen,
    marginTop: 6,
  },
  title: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  body: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  timestamp: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.textSecondary,
  },
})
