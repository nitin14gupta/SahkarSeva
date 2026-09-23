import { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import * as SecureStore from 'expo-secure-store'
import { Camera } from 'lucide-react-native'
import { KeyboardAvoidingWrapper, PrimaryButton, Screen } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { CacheKeys, Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { Role } from '@/types/auth'

export default function ProfileSetupScreen() {
  const { role } = useLocalSearchParams<{ role: Role }>()
  const [name, setName] = useState('')
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { handleCompleteProfile } = useAuth()

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    if (!result.canceled) setPhotoUri(result.assets[0].uri)
  }

  async function handleSubmit() {
    if (!name.trim() || !role) return
    setLoading(true)
    try {
      await Location.requestForegroundPermissionsAsync()
      const language = (await SecureStore.getItemAsync(CacheKeys.language)) ?? 'en'
      await handleCompleteProfile({ name: name.trim(), role, language })
      router.replace(role === 'worker' ? '/(worker)/(tabs)/home' : '/(customer)/(tabs)/home')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingWrapper transparent>
        <View style={s.inner}>
          <Text style={s.title}>Set up your profile</Text>
          <Text style={s.subtitle}>This is how workers and customers will see you</Text>

          <Pressable style={s.photoPicker} onPress={pickPhoto}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={s.photo} />
            ) : (
              <Camera size={24} color={Colors.textSecondary} strokeWidth={2} />
            )}
          </Pressable>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor={Colors.inkDisabled}
            style={s.input}
          />
        </View>

        <View style={s.footer}>
          <PrimaryButton
            label="Finish"
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
  input: {
    height: 52,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: 16,
  },
})
