import { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { Camera, X } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/ui'
import { useBookingDraftStore } from '@/store/bookingDraftStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'

export default function AddNotesScreen() {
  const { workerId } = useLocalSearchParams<{ workerId: string }>()
  const insets = useSafeAreaInsets()
  const setDraft = useBookingDraftStore((s) => s.setDraft)
  const [notes, setNotes] = useState('')
  const [photoUri, setPhotoUri] = useState<string | null>(null)

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    })
    if (!result.canceled) setPhotoUri(result.assets[0].uri)
  }

  function handleContinue() {
    setDraft({ notes: notes.trim(), photoUri })
    router.push({ pathname: '/booking/[workerId]/summary', params: { workerId } })
  }

  function handleSkip() {
    setDraft({ notes: '', photoUri: null })
    router.push({ pathname: '/booking/[workerId]/summary', params: { workerId } })
  }

  return (
    <View style={s.container}>
      <AppHeader title="What needs fixing?" showBack />

      <View style={s.content}>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Describe the issue (optional)"
          placeholderTextColor={Colors.inkDisabled}
          multiline
          style={s.textArea}
        />

        {photoUri ? (
          <View style={s.photoWrap}>
            <Image source={{ uri: photoUri }} style={s.photo} />
            <Pressable style={s.removePhoto} onPress={() => setPhotoUri(null)}>
              <X size={14} color={Colors.white} strokeWidth={2.5} />
            </Pressable>
          </View>
        ) : (
          <Pressable style={s.addPhoto} onPress={pickPhoto}>
            <Camera size={18} color={Colors.textSecondary} strokeWidth={2} />
            <Text style={s.addPhotoText}>Attach a photo (optional)</Text>
          </Pressable>
        )}
      </View>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label="Continue" onPress={handleContinue} />
        <View style={{ height: Spacing.sm }} />
        <SecondaryButton label="Skip" onPress={handleSkip} />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.md,
  },
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
  addPhoto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  photoWrap: {
    width: 96,
    height: 96,
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
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
})
