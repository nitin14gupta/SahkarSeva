import { useMemo, useState } from 'react'
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { ChevronDown, ChevronUp, Mail } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { AppHeader, Input, PrimaryButton, SearchBar } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, DESCRIPTION_LENGTH_HINT_KEY, DESCRIPTION_MAX_LENGTH, DESCRIPTION_MIN_LENGTH, FontFamily, Radius, Spacing } from '@/constants'

const SUPPORT_EMAIL = 'support@sahkarseva.in'

export default function HelpScreen() {
  const { t } = useTranslation('common')
  const { t: tc } = useTranslation('customer')
  const CUSTOMER_FAQS = [
    { q: tc('help.customerFaq1Q'), a: tc('help.customerFaq1A') },
    { q: tc('help.customerFaq2Q'), a: tc('help.customerFaq2A') },
    { q: tc('help.customerFaq3Q'), a: tc('help.customerFaq3A') },
    { q: tc('help.customerFaq4Q'), a: tc('help.customerFaq4A') },
    { q: tc('help.customerFaq5Q'), a: tc('help.customerFaq5A') },
  ]
  const WORKER_FAQS = [
    { q: tc('help.workerFaq1Q'), a: tc('help.workerFaq1A') },
    { q: tc('help.workerFaq2Q'), a: tc('help.workerFaq2A') },
    { q: tc('help.workerFaq3Q'), a: tc('help.workerFaq3A') },
    { q: tc('help.workerFaq4Q'), a: tc('help.workerFaq4A') },
    { q: tc('help.workerFaq5Q'), a: tc('help.workerFaq5A') },
  ]
  const { bookingId, audience } = useLocalSearchParams<{ bookingId?: string; audience?: 'worker' | 'customer' }>()
  const show = usePillStore((s) => s.show)
  const [query, setQuery] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const faqs = audience === 'worker' ? WORKER_FAQS : CUSTOMER_FAQS
  const filteredFaqs = useMemo(
    () => faqs.filter((f) => f.q.toLowerCase().includes(query.toLowerCase())),
    [query, faqs]
  )

  const messageLength = message.trim().length
  const messageValid = messageLength >= DESCRIPTION_MIN_LENGTH && messageLength <= DESCRIPTION_MAX_LENGTH
  const canSubmitIssue = !!subject.trim() && messageValid

  async function handleSubmitIssue() {
    if (!canSubmitIssue) return
    setSubmitting(true)
    try {
      await apiService.createTicket({ subject: subject.trim(), message: message.trim(), booking_id: bookingId })
      show(tc('help.issueSubmitted'), 'success')
      setSubject('')
      setMessage('')
    } catch {
      show(tc('help.issueSubmitError'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={s.container}>
      <AppHeader title={tc('help.title')} showBack />

      <ScrollView contentContainerStyle={s.content}>
        <SearchBar value={query} onChangeText={setQuery} placeholder={tc('help.searchPlaceholder')} />

        <View style={s.faqList}>
          {filteredFaqs.map((faq, i) => {
            const open = openIndex === i
            return (
              <Pressable key={faq.q} style={s.faqItem} onPress={() => setOpenIndex(open ? null : i)}>
                <View style={s.faqHeader}>
                  <Text style={s.faqQuestion}>{faq.q}</Text>
                  {open ? <ChevronUp size={16} color={Colors.textSecondary} /> : <ChevronDown size={16} color={Colors.textSecondary} />}
                </View>
                {open && <Text style={s.faqAnswer}>{faq.a}</Text>}
              </Pressable>
            )
          })}
        </View>

        <Text style={s.sectionTitle}>{tc('help.raiseIssueTitle')}</Text>
        <Input placeholder={tc('help.subjectPlaceholder')} value={subject} onChangeText={setSubject} />
        <View style={{ height: Spacing.sm }} />
        <TextInput
          value={message}
          onChangeText={(v) => setMessage(v.slice(0, DESCRIPTION_MAX_LENGTH))}
          placeholder={tc('help.messagePlaceholder')}
          placeholderTextColor={Colors.inkDisabled}
          multiline
          style={s.textArea}
        />
        <Text style={[s.counter, messageLength > 0 && !messageValid && s.counterError]}>
          {t(DESCRIPTION_LENGTH_HINT_KEY, { length: messageLength, max: DESCRIPTION_MAX_LENGTH, min: DESCRIPTION_MIN_LENGTH })}
        </Text>
        <View style={{ height: Spacing.sm }} />
        <PrimaryButton label={tc('help.submitButton')} onPress={handleSubmitIssue} disabled={!canSubmitIssue} loading={submitting} />

        <Pressable style={s.emailRow} onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}>
          <Mail size={16} color={Colors.textSecondary} strokeWidth={2} />
          <Text style={s.emailText}>{SUPPORT_EMAIL}</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.xl,
  },
  faqList: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  faqItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flex: 1,
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  faqAnswer: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 19,
  },
  sectionTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  textArea: {
    minHeight: 100,
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
  },
  counterError: {
    color: Colors.destructive,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  emailText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
})
