import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Bell, CalendarClock, ChevronRight, HelpCircle, Landmark, LogOut, Star } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { Avatar, Input, PrimaryButton, StatusBadge } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useAuthStore } from '@/store/authStore'
import { usePillStore } from '@/store/pillStore'
import * as apiService from '@/api/apiService'
import { Colors, FontFamily, Spacing } from '@/constants'
import type { VerificationStatus } from '@/types/worker'

export default function WorkerProfileScreen() {
  const { t } = useTranslation('worker')
  const insets = useSafeAreaInsets()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const { handleLogout } = useAuth()
  const show = usePillStore((s) => s.show)
  const { pickAndUpload, uploading } = useImageUpload('profile-photos')

  const [name, setName] = useState(user?.name ?? '')
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        try {
          const { worker } = await apiService.getWorkerMe()
          if (!cancelled) setVerificationStatus(worker.verification_status)
        } catch {
          // non-critical — the badge just won't render
        }
      })()
      return () => { cancelled = true }
    }, [])
  )

  async function pickPhoto() {
    try {
      const picked = await pickAndUpload()
      if (!picked) return
      setPhotoUri(picked.localUri)
      setPhotoUrl(picked.remoteUrl)
    } catch {
      show(t('profile.photoUploadError'), 'error')
    }
  }

  async function handleSave() {
    if (!user || !name.trim()) return
    setSaving(true)
    try {
      const { user: updated } = await apiService.completeProfile({
        name: name.trim(),
        role: 'worker',
        language: user.language,
        photo_url: photoUrl ?? undefined,
      })
      setUser(updated)
      show(t('profile.saveSuccess'), 'success')
    } catch {
      show(t('profile.saveError'), 'error')
    } finally {
      setSaving(false)
    }
  }

  function handleLanguageChange() {
    router.push({ pathname: '/language', params: { from: 'profile' } })
  }

  async function onLogoutPress() {
    await handleLogout()
    router.replace('/splash')
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <Text style={s.title}>{t('profile.title')}</Text>

      <View style={s.header}>
        <Pressable onPress={pickPhoto} disabled={uploading} style={s.avatarWrap}>
          <Avatar uri={photoUri ?? user?.photo_url} size={72} />
          {uploading && (
            <View style={s.avatarOverlay}>
              <ActivityIndicator color={Colors.white} size="small" />
            </View>
          )}
        </Pressable>
        <View style={{ flex: 1 }}>
          <Input placeholder={t('profile.namePlaceholder')} value={name} onChangeText={setName} />
        </View>
      </View>
      <View style={s.metaRow}>
        <Text style={s.phone}>+91 {user?.phone}</Text>
        {!!verificationStatus && (
          <StatusBadge
            tone={verificationStatus === 'verified' ? 'success' : verificationStatus === 'rejected' ? 'error' : 'pending'}
            label={verificationStatus === 'verified' ? t('profile.verified') : verificationStatus === 'rejected' ? t('profile.rejected') : t('profile.pending')}
          />
        )}
      </View>
      <PrimaryButton label={t('profile.saveButton')} onPress={handleSave} loading={saving} disabled={!name.trim()} />

      <View style={s.menu}>
        <MenuRow icon={Star} label={t('profile.menu.reviews')} onPress={() => router.push('/reviews')} />
        <MenuRow icon={CalendarClock} label={t('profile.menu.availability')} onPress={() => router.push('/availability')} />
        <MenuRow icon={Landmark} label={t('profile.menu.payout')} onPress={() => router.push('/payout')} />
        <MenuRow icon={Bell} label={t('profile.menu.notifications')} onPress={() => router.push('/notifications')} />
        <MenuRow icon={ChevronRight} label={t('profile.menu.language', { lang: user?.language?.toUpperCase() ?? 'EN' })} onPress={handleLanguageChange} />
        <MenuRow icon={HelpCircle} label={t('profile.menu.help')} onPress={() => router.push({ pathname: '/help', params: { audience: 'worker' } })} />
        <MenuRow icon={LogOut} label={t('profile.menu.logout')} onPress={onLogoutPress} destructive />
      </View>
    </View>
  )
}

function MenuRow({ icon: Icon, label, onPress, destructive }: {
  icon: typeof Star; label: string; onPress: () => void; destructive?: boolean
}) {
  return (
    <Pressable style={s.menuRow} onPress={onPress}>
      <Icon size={18} color={destructive ? Colors.destructive : Colors.textSecondary} strokeWidth={2} />
      <Text style={[s.menuLabel, destructive && s.menuLabelDestructive]}>{label}</Text>
      <ChevronRight size={16} color={Colors.textSecondary} strokeWidth={2} />
    </Pressable>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 22,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.sm,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
  },
  phone: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  menu: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.screenPadding,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  menuLabel: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  menuLabelDestructive: {
    color: Colors.destructive,
  },
})
