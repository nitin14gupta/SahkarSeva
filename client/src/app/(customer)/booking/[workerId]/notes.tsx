import { useState } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Camera, X } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { AppHeader, PrimaryButton } from '@/components/ui'
import { useBookingDraftStore, type BookingDraftPhoto } from '@/store/bookingDraftStore'
import { useImageUpload } from '@/hooks/useImageUpload'
import { usePillStore } from '@/store/pillStore'
import {
  BOOKING_PHOTOS_MAX_COUNT,
  BOOKING_PHOTOS_MIN_COUNT,
  Colors,
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  FontFamily,
  Radius,
  Spacing,
} from '@/constants'

export default function AddNotesScreen() {
  const { t } = useTranslation('customer')
  const { workerId } = useLocalSearchParams<{ workerId: string }>()
  const insets = useSafeAreaInsets()
  const setDraft = useBookingDraftStore((s) => s.setDraft)
  const show = usePillStore((s) => s.show)
  const { pickMultipleAndUpload, uploading } = useImageUpload('booking-photos')

  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState<BookingDraftPhoto[]>([])

  const notesLength = notes.trim().length
  const notesValid = notesLength >= DESCRIPTION_MIN_LENGTH && notesLength <= DESCRIPTION_MAX_LENGTH
  const photosValid = photos.length >= BOOKING_PHOTOS_MIN_COUNT && photos.length <= BOOKING_PHOTOS_MAX_COUNT
  const canContinue = notesValid && photosValid

  async function handleAddPhotos() {
    const remaining = BOOKING_PHOTOS_MAX_COUNT - photos.length
    if (remaining <= 0) return
    try {
      const picked = await pickMultipleAndUpload(remaining)
      if (picked.length > 0) setPhotos((prev) => [...prev, ...picked].slice(0, BOOKING_PHOTOS_MAX_COUNT))
    } catch {
      show(t('bookingNotes.uploadError'), 'error')
    }
  }

  function removePhoto(remoteUrl: string) {
    setPhotos((prev) => prev.filter((p) => p.remoteUrl !== remoteUrl))
  }

  function handleContinue() {
    if (!canContinue) return
    setDraft({ notes: notes.trim(), photos })
    router.push({ pathname: '/booking/[workerId]/summary', params: { workerId } })
  }

  return (
    <View style={s.container}>
      <AppHeader title={t('bookingNotes.title')} showBack />

      <ScrollView style={s.content} contentContainerStyle={s.contentInner}>
        <TextInput
          value={notes}
          onChangeText={(v) => setNotes(v.slice(0, DESCRIPTION_MAX_LENGTH))}
          placeholder={t('bookingNotes.placeholder')}
          placeholderTextColor={Colors.inkDisabled}
          multiline
          style={s.textArea}
        />
        <Text style={[s.counter, notesLength > 0 && !notesValid && s.counterError]}>
          {t('bookingNotes.counter', { count: notesLength, max: DESCRIPTION_MAX_LENGTH, min: DESCRIPTION_MIN_LENGTH })}
        </Text>

        <Text style={s.sectionLabel}>
          {t('bookingNotes.photosLabel', { count: photos.length, max: BOOKING_PHOTOS_MAX_COUNT, min: BOOKING_PHOTOS_MIN_COUNT })}
        </Text>
        <View style={s.photoGrid}>
          {photos.map((photo) => (
            <View key={photo.remoteUrl} style={s.photoWrap}>
              <Image source={{ uri: photo.localUri }} style={s.photo} />
              <Pressable style={s.removePhoto} onPress={() => removePhoto(photo.remoteUrl)}>
                <X size={12} color={Colors.white} strokeWidth={2.5} />
              </Pressable>
            </View>
          ))}
          {photos.length < BOOKING_PHOTOS_MAX_COUNT && (
            <Pressable style={s.addPhoto} onPress={handleAddPhotos} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator color={Colors.brandGreen} size="small" />
              ) : (
                <>
                  <Camera size={18} color={Colors.textSecondary} strokeWidth={2} />
                  <Text style={s.addPhotoText}>{t('bookingNotes.addPhoto')}</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label={t('common:continue')} onPress={handleContinue} disabled={!canContinue} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingHorizontal: Spacing.screenPadding },
  contentInner: { paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  textArea: {
    minHeight: 120,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
  },
  counter: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  counterError: {
    color: Colors.destructive,
  },
  sectionLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  photoWrap: {
    width: 84,
    height: 84,
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhoto: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoto: {
    width: 84,
    height: 84,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
})
