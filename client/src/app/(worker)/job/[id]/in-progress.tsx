import { useState } from 'react'
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Camera, CheckCircle2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { AppHeader, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { useImageUpload } from '@/hooks/useImageUpload'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'

interface PickedPhoto {
  localUri: string
  remoteUrl: string
}

export default function JobInProgressScreen() {
  const { t } = useTranslation('worker')
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const show = usePillStore((s) => s.show)
  const { pickAndUpload, uploading } = useImageUpload('booking-photos')

  const [started, setStarted] = useState(false)
  const [beforePhoto, setBeforePhoto] = useState<PickedPhoto | null>(null)
  const [afterPhoto, setAfterPhoto] = useState<PickedPhoto | null>(null)
  const [saving, setSaving] = useState(false)

  async function pickPhoto(setPhoto: (photo: PickedPhoto) => void) {
    try {
      const picked = await pickAndUpload()
      if (!picked) return
      setPhoto(picked)
    } catch {
      show(t('jobInProgress.uploadError'), 'error')
    }
  }

  async function handleMarkStarted() {
    setSaving(true)
    try {
      if (beforePhoto) await apiService.attachBookingPhotos(id, { before_photo_url: beforePhoto.remoteUrl })
      setStarted(true)
    } catch {
      show(t('jobInProgress.beforeSaveError'), 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleMarkCompleted() {
    setSaving(true)
    try {
      if (afterPhoto) await apiService.attachBookingPhotos(id, { after_photo_url: afterPhoto.remoteUrl })
      router.push({ pathname: '/job/[id]/complete', params: { id } })
    } catch {
      show(t('jobInProgress.afterSaveError'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={s.container}>
      <AppHeader title={started ? t('jobInProgress.headerInProgress') : t('jobInProgress.headerReady')} showBack />
      <View style={s.inner}>
        {!started ? (
          <>
            <Text style={s.title}>{t('jobInProgress.beforeTitle')}</Text>
            <Text style={s.subtitle}>{t('jobInProgress.beforeSubtitle')}</Text>
            <PhotoSlot photo={beforePhoto} uploading={uploading} onPress={() => pickPhoto(setBeforePhoto)} addPhotoLabel={t('jobInProgress.addPhoto')} />
          </>
        ) : (
          <>
            <View style={s.startedBadge}>
              <CheckCircle2 size={16} color={Colors.brandGreen} strokeWidth={2} />
              <Text style={s.startedText}>{t('jobInProgress.startedBadge')}</Text>
            </View>
            <Text style={s.title}>{t('jobInProgress.afterTitle')}</Text>
            <Text style={s.subtitle}>{t('jobInProgress.afterSubtitle')}</Text>
            <PhotoSlot photo={afterPhoto} uploading={uploading} onPress={() => pickPhoto(setAfterPhoto)} addPhotoLabel={t('jobInProgress.addPhoto')} />
          </>
        )}
      </View>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {!started ? (
          <PrimaryButton label={t('jobInProgress.markStartedButton')} onPress={handleMarkStarted} loading={saving} />
        ) : (
          <PrimaryButton label={t('jobInProgress.markCompletedButton')} onPress={handleMarkCompleted} loading={saving} />
        )}
      </View>
    </View>
  )
}

function PhotoSlot({ photo, uploading, onPress, addPhotoLabel }: { photo: PickedPhoto | null; uploading: boolean; onPress: () => void; addPhotoLabel: string }) {
  return (
    <Pressable style={s.photoSlot} onPress={onPress} disabled={uploading}>
      {uploading ? (
        <ActivityIndicator color={Colors.brandGreen} />
      ) : photo ? (
        <Image source={{ uri: photo.localUri }} style={s.photoImage} />
      ) : (
        <>
          <Camera size={22} color={Colors.textSecondary} strokeWidth={2} />
          <Text style={s.photoSlotText}>{addPhotoLabel}</Text>
        </>
      )}
    </Pressable>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.xl },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 20,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  startedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: 999,
    backgroundColor: 'rgba(31,77,58,0.1)',
    marginBottom: Spacing.lg,
  },
  startedText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.brandGreen,
  },
  photoSlot: {
    height: 180,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoSlotText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  footer: { paddingHorizontal: Spacing.screenPadding },
})
