import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Star } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PrimaryButton, SecondaryButton } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'

const TAG_OPTIONS = ['On time', 'Professional', 'Great work', 'Polite', 'Skilled', 'Fair pricing']

export default function RateReviewScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
  const insets = useSafeAreaInsets()
  const show = usePillStore((s) => s.show)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  async function handleSubmit() {
    if (rating === 0) return
    setSubmitting(true)
    try {
      await apiService.createReview({ booking_id: bookingId, rating, comment: comment.trim() || undefined, tags })
      show('Thanks for your review!', 'success')
      router.replace('/(customer)/(tabs)/home')
    } catch {
      show('Could not submit your review. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  function handleSkip() {
    router.replace('/(customer)/(tabs)/home')
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.content}>
        <Text style={s.title}>How was the service?</Text>

        <View style={s.starRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Pressable key={i} onPress={() => setRating(i)} hitSlop={6}>
              <Star
                size={36}
                color={Colors.gold}
                fill={i <= rating ? Colors.gold : 'transparent'}
                strokeWidth={1.5}
              />
            </Pressable>
          ))}
        </View>

        <View style={s.tagRow}>
          {TAG_OPTIONS.map((tag) => (
            <Pressable
              key={tag}
              style={[s.tag, tags.includes(tag) && s.tagSelected]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[s.tagText, tags.includes(tag) && s.tagTextSelected]}>{tag}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Leave a comment (optional)"
          placeholderTextColor={Colors.inkDisabled}
          multiline
          style={s.textArea}
        />
      </View>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <PrimaryButton label="Submit Review" onPress={handleSubmit} disabled={rating === 0} loading={submitting} />
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
    paddingTop: Spacing.xl,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 22,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  tagSelected: {
    borderColor: Colors.brandGreen,
    backgroundColor: Colors.brandGreen,
  },
  tagText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  tagTextSelected: {
    color: Colors.inkOnAccent,
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
  footer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
})
