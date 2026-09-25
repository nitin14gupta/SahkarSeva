import { useState } from 'react'
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Camera, Check } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { AppHeader, PrimaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { useWorkerRegistrationDraftStore } from '@/store/workerRegistrationDraftStore'
import { usePillStore } from '@/store/pillStore'
import { useImageUpload } from '@/hooks/useImageUpload'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { WorkerDocumentType } from '@/types/worker'

interface SlotState {
  localUri: string | null
  remoteUrl: string | null
}

export default function WorkerRegisterDocumentsScreen() {
  const { t } = useTranslation('worker')
  const { mode } = useLocalSearchParams<{ mode?: string }>()
  const isResubmit = mode === 'resubmit'
  const insets = useSafeAreaInsets()
  const SLOTS: { type: WorkerDocumentType; label: string }[] = [
    { type: 'id_proof', label: t('registerDocuments.idProofLabel') },
    { type: 'skill_certificate', label: t('registerDocuments.skillCertLabel') },
  ]
  const draft = useWorkerRegistrationDraftStore()
  const show = usePillStore((s) => s.show)
  const { pickAndUpload, uploading } = useImageUpload('worker-documents')

  const [docs, setDocs] = useState<Record<WorkerDocumentType, SlotState>>({
    id_proof: { localUri: null, remoteUrl: null },
    skill_certificate: { localUri: null, remoteUrl: null },
  })
  const [activeSlot, setActiveSlot] = useState<WorkerDocumentType | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handlePick(type: WorkerDocumentType) {
    setActiveSlot(type)
    try {
      const picked = await pickAndUpload()
      if (!picked) return
      setDocs((prev) => ({ ...prev, [type]: { localUri: picked.localUri, remoteUrl: picked.remoteUrl } }))
    } catch {
      show(t('registerDocuments.uploadError'), 'error')
    } finally {
      setActiveSlot(null)
    }
  }

  const allUploaded = SLOTS.every((slot) => docs[slot.type].remoteUrl)

  async function handleSubmit() {
    if (!allUploaded) return
    setSubmitting(true)
    const documents = SLOTS.map((slot) => ({
      doc_type: slot.type,
      url: docs[slot.type].remoteUrl!,
      label: slot.label,
    }))
    try {
      if (isResubmit) {
        await apiService.submitWorkerDocuments(documents)
      } else {
        await apiService.registerWorker({
          id_number: draft.idNumber,
          cooperative_id: draft.cooperativeId ?? undefined,
          categories: draft.categories,
          years_experience: draft.yearsExperience,
          price_min: draft.priceMin ?? undefined,
          price_max: draft.priceMax ?? undefined,
          lat: draft.lat ?? undefined,
          lng: draft.lng ?? undefined,
          documents,
        })
        draft.reset()
      }
      router.replace('/(worker)/(tabs)/home')
    } catch {
      show(t('registerDocuments.submitError'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={s.container}>
      <AppHeader title={t('registerDocuments.title')} showBack />
      <View style={s.inner}>
        {!isResubmit && <Text style={s.stepLabel}>{t('registerDocuments.stepLabel')}</Text>}
        <Text style={s.title}>{isResubmit ? t('registerDocuments.headingResubmit') : t('registerDocuments.headingUpload')}</Text>
        <Text style={s.subtitle}>{t('registerDocuments.subtitle')}</Text>

        {SLOTS.map((slot) => {
          const state = docs[slot.type]
          const isActive = activeSlot === slot.type && uploading
          return (
            <Pressable key={slot.type} style={s.slot} onPress={() => handlePick(slot.type)} disabled={uploading}>
              <View style={s.thumb}>
                {isActive ? (
                  <ActivityIndicator color={Colors.brandGreen} />
                ) : state.localUri ? (
                  <Image source={{ uri: state.localUri }} style={s.thumbImage} />
                ) : (
                  <Camera size={20} color={Colors.textSecondary} strokeWidth={2} />
                )}
              </View>
              <Text style={s.slotLabel}>{slot.label}</Text>
              {!!state.remoteUrl && (
                <View style={s.checkWrap}>
                  <Check size={16} color={Colors.brandGreen} strokeWidth={2.5} />
                </View>
              )}
            </Pressable>
          )
        })}
      </View>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton
          label={isResubmit ? t('registerDocuments.resubmitButton') : t('registerDocuments.submitButton')}
          onPress={handleSubmit}
          disabled={!allUploaded}
          loading={submitting}
        />
      </View>
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
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: { width: '100%', height: '100%' },
  slotLabel: {
    flex: 1,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  checkWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(31,77,58,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { paddingHorizontal: Spacing.screenPadding },
})
