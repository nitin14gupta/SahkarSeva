import { useMemo, useState } from 'react'
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { ChevronDown, ChevronUp, Mail } from 'lucide-react-native'
import { AppHeader, Input, PrimaryButton, SearchBar } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'

const FAQS = [
  { q: 'How do I book a worker?', a: 'Go to Home, pick a category or search, choose a worker, then pick a date & time and confirm your booking.' },
  { q: 'How is the price decided?', a: 'Each worker sets their own price range, shown on their profile. The final amount is confirmed before you pay.' },
  { q: 'What if I need to cancel?', a: 'Open the booking from Bookings > Upcoming and tap Cancel. Cancellations under 1 hour before the slot may incur a partial charge.' },
  { q: 'How do refunds work?', a: 'Refunds for cancelled or disputed bookings are processed to your original payment method within 5-7 business days.' },
  { q: 'Are workers verified?', a: 'Every worker on SahkarSeva is verified through their cooperative society before they can accept bookings.' },
]

const SUPPORT_EMAIL = 'support@sahkarseva.in'

export default function HelpScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>()
  const show = usePillStore((s) => s.show)
  const [query, setQuery] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const filteredFaqs = useMemo(
    () => FAQS.filter((f) => f.q.toLowerCase().includes(query.toLowerCase())),
    [query]
  )

  async function handleSubmitIssue() {
    if (!subject.trim() || !message.trim()) return
    setSubmitting(true)
    try {
      await apiService.createTicket({ subject: subject.trim(), message: message.trim(), booking_id: bookingId })
      show('Your issue has been submitted', 'success')
      setSubject('')
      setMessage('')
    } catch {
      show('Could not submit your issue', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={s.container}>
      <AppHeader title="Help & Support" showBack />

      <ScrollView contentContainerStyle={s.content}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search FAQs" />

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

        <Text style={s.sectionTitle}>Raise an issue</Text>
        <Input placeholder="Subject" value={subject} onChangeText={setSubject} />
        <View style={{ height: Spacing.sm }} />
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Describe the issue"
          placeholderTextColor={Colors.inkDisabled}
          multiline
          style={s.textArea}
        />
        <View style={{ height: Spacing.md }} />
        <PrimaryButton label="Submit" onPress={handleSubmitIssue} disabled={!subject.trim() || !message.trim()} loading={submitting} />

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
