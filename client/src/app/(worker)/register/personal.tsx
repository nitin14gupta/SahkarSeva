import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppHeader, Input, KeyboardAvoidingWrapper, MapPinPicker, PrimaryButton } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { useWorkerRegistrationDraftStore } from '@/store/workerRegistrationDraftStore'
import { Colors, FontFamily, Spacing } from '@/constants'

export default function WorkerRegisterPersonalScreen() {
  const insets = useSafeAreaInsets()
  const user = useAuthStore((s) => s.user)
  const draft = useWorkerRegistrationDraftStore()
  const [idNumber, setIdNumber] = useState(draft.idNumber)
  const [addressLine1, setAddressLine1] = useState(draft.addressLine1)
  const [coords, setCoords] = useState(
    draft.lat != null && draft.lng != null ? { lat: draft.lat, lng: draft.lng } : undefined
  )

  const isValid = addressLine1.trim().length > 0 && idNumber.trim().length > 0

  function handleContinue() {
    draft.setDraft({
      idNumber: idNumber.trim(),
      addressLine1: addressLine1.trim(),
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    })
    router.push('/register/cooperative-skills')
  }

  return (
    <View style={s.container}>
      <AppHeader title="Personal Details" showBack />
      <KeyboardAvoidingWrapper transparent>
        <View style={s.inner}>
          <Text style={s.stepLabel}>Step 1 of 3</Text>
          <Text style={s.title}>Tell us about yourself</Text>

          <View style={s.field}>
            <Text style={s.fieldLabel}>Name</Text>
            <Text style={s.readonlyValue}>{user?.name}</Text>
          </View>
          <View style={s.field}>
            <Text style={s.fieldLabel}>Phone</Text>
            <Text style={s.readonlyValue}>+91 {user?.phone}</Text>
          </View>

          <Text style={s.fieldLabel}>ID number</Text>
          <Input
            value={idNumber}
            onChangeText={setIdNumber}
            placeholder="Aadhaar / voter ID number"
            style={s.gapBelow}
          />

          <Text style={s.fieldLabel}>Address</Text>
          <Input
            value={addressLine1}
            onChangeText={setAddressLine1}
            placeholder="House no, street, area"
            style={s.gapBelow}
          />

          <MapPinPicker initialCoords={coords} onPick={setCoords} height={180} />
        </View>

        <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <PrimaryButton label="Continue" onPress={handleContinue} disabled={!isValid} />
        </View>
      </KeyboardAvoidingWrapper>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md },
  stepLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.brandGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  field: { marginBottom: Spacing.md },
  fieldLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  readonlyValue: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  gapBelow: { marginBottom: Spacing.md },
  footer: { paddingHorizontal: Spacing.screenPadding },
})
