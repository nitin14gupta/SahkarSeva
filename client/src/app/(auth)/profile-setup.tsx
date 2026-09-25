import { useState } from 'react'
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as Location from 'expo-location'
import * as SecureStore from 'expo-secure-store'
import { Camera } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Input, KeyboardAvoidingWrapper, PrimaryButton, Screen } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useImageUpload } from '@/hooks/useImageUpload'
import { usePillStore } from '@/store/pillStore'
import { CacheKeys, Colors, FontFamily, Spacing } from '@/constants'
import type { Role } from '@/types/auth'

export default function ProfileSetupScreen() {
  const { t } = useTranslation('auth')
  const { role } = useLocalSearchParams<{ role: Role }>()
  const insets = useSafeAreaInsets()
  const [name, setName] = useState('')
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { handleCompleteProfile } = useAuth()
  const { pickAndUpload, uploading } = useImageUpload('profile-photos')
  const show = usePillStore((s) => s.show)

  async function pickPhoto() {
    try {
      const picked = await pickAndUpload()
      if (!picked) return
      setPhotoUri(picked.localUri)
      setPhotoUrl(picked.remoteUrl)
    } catch {
      show(t('profileSetup.photoUploadError'), 'error')
    }
  }

  async function handleSubmit() {
    if (!name.trim() || !role) return
    setLoading(true)
    try {
      await Location.requestForegroundPermissionsAsync()
      const language = (await SecureStore.getItemAsync(CacheKeys.language)) ?? 'en'
      await handleCompleteProfile({ name: name.trim(), role, language, photo_url: photoUrl ?? undefined })
      // A freshly-profiled worker can't have a `workers` row yet, so skip the
      // GET /worker/me check that resolveWorkerRoute would otherwise do.
      router.replace(role === 'worker' ? '/(worker)/register/personal' : '/(customer)/(tabs)/home')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingWrapper transparent>
        <View style={s.inner}>
          <Text style={s.title}>{t('profileSetup.title')}</Text>
          <Text style={s.subtitle}>{t('profileSetup.subtitle')}</Text>

          <Pressable style={s.photoPicker} onPress={pickPhoto} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator color={Colors.brandGreen} />
            ) : photoUri ? (
              <Image source={{ uri: photoUri }} style={s.photo} />
            ) : (
              <Camera size={24} color={Colors.textSecondary} strokeWidth={2} />
            )}
          </Pressable>

          <Input
            value={name}
            onChangeText={setName}
            placeholder={t('profileSetup.namePlaceholder')}
          />
        </View>

        <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <PrimaryButton
            label={t('common:finish')}
            onPress={handleSubmit}
            disabled={!name.trim()}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingWrapper>
    </Screen>
  )
}

const s = StyleSheet.create({
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
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
    marginBottom: Spacing.xl,
  },
  photoPicker: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
  },
})
