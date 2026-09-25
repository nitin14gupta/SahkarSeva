import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Languages, Phone, Send } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppHeader, HeaderIconBtn, KeyboardAvoidingWrapper } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { useAuthStore } from '@/store/authStore'
import { useChatSocket } from '@/hooks/useChatSocket'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { BookingDetail } from '@/types/booking'

const QUICK_REPLIES = ['Thanks!', 'How long will it take?', "I'm at the address", 'Please call me']
const TYPING_DEBOUNCE_MS = 1500

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const myUserId = useAuthStore((s) => s.user?.id)
  const myLanguage = useAuthStore((s) => s.user?.language) ?? 'en'
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [draft, setDraft] = useState('')
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [translating, setTranslating] = useState<Record<string, boolean>>({})
  const listRef = useRef<FlatList>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { messages, partnerTyping, sendMessage, setTyping } = useChatSocket(id)

  async function handleToggleTranslate(messageId: string, text: string) {
    if (translations[messageId] !== undefined) {
      setTranslations((prev) => {
        const next = { ...prev }
        delete next[messageId]
        return next
      })
      return
    }
    setTranslating((prev) => ({ ...prev, [messageId]: true }))
    try {
      const { translated_text } = await apiService.translateText(
        text,
        booking?.worker_language ?? 'en',
        myLanguage
      )
      setTranslations((prev) => ({ ...prev, [messageId]: translated_text }))
    } finally {
      setTranslating((prev) => ({ ...prev, [messageId]: false }))
    }
  }

  useEffect(() => {
    let cancelled = false
    apiService.getBookingDetail(id).then(({ booking }) => { if (!cancelled) setBooking(booking) })
    return () => { cancelled = true }
  }, [id])

  function handleChangeDraft(text: string) {
    setDraft(text)
    setTyping(text.length > 0)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => setTyping(false), TYPING_DEBOUNCE_MS)
  }

  async function handleSend(text: string) {
    if (!text.trim()) return
    setDraft('')
    setTyping(false)
    await sendMessage(text)
  }

  return (
    <View style={s.container}>
      <AppHeader
        title={booking?.worker_name ?? 'Chat'}
        showBack
        rightAction={booking && (
          <HeaderIconBtn onPress={() => Linking.openURL(`tel:${booking.worker_phone}`)}>
            <Phone size={18} color={Colors.brandGreen} strokeWidth={2} />
          </HeaderIconBtn>
        )}
      />

      <KeyboardAvoidingWrapper transparent>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={s.messages}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isMe = item.sender_id === myUserId
            const translated = translations[item.id]
            const isTranslating = translating[item.id]
            return (
              <View style={[s.bubbleRow, isMe && s.bubbleRowMe]}>
                <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleThem]}>
                  <Text style={[s.bubbleText, isMe && s.bubbleTextMe]}>{translated ?? item.message}</Text>
                  {!isMe && booking?.worker_language && booking.worker_language !== myLanguage && (
                    <Pressable
                      style={s.translateBtn}
                      onPress={() => handleToggleTranslate(item.id, item.message)}
                      disabled={isTranslating}
                    >
                      {isTranslating ? (
                        <ActivityIndicator size="small" color={Colors.textSecondary} />
                      ) : (
                        <>
                          <Languages size={12} color={Colors.textSecondary} strokeWidth={2} />
                          <Text style={s.translateBtnText}>
                            {translated ? 'Show original' : 'Translate'}
                          </Text>
                        </>
                      )}
                    </Pressable>
                  )}
                </View>
              </View>
            )
          }}
        />

        {partnerTyping && (
          <View style={s.typingRow}>
            <Text style={s.typingText}>{booking?.worker_name ?? 'They'} is typing…</Text>
          </View>
        )}

        <View style={s.quickReplies}>
          <FlatList
            data={QUICK_REPLIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(t) => t}
            contentContainerStyle={{ gap: Spacing.sm }}
            renderItem={({ item }) => (
              <Pressable style={s.quickChip} onPress={() => handleSend(item)}>
                <Text style={s.quickChipText}>{item}</Text>
              </Pressable>
            )}
          />
        </View>

        <View style={[s.inputRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            value={draft}
            onChangeText={handleChangeDraft}
            placeholder="Type a message"
            placeholderTextColor={Colors.inkDisabled}
            style={s.input}
            onSubmitEditing={() => handleSend(draft)}
          />
          <Pressable style={s.sendBtn} onPress={() => handleSend(draft)} disabled={!draft.trim()}>
            <Send size={18} color={Colors.inkOnAccent} strokeWidth={2} />
          </Pressable>
        </View>
      </KeyboardAvoidingWrapper>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  messages: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
  },
  bubbleRowMe: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.card,
  },
  bubbleThem: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  bubbleMe: {
    backgroundColor: Colors.brandGreen,
  },
  bubbleText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  bubbleTextMe: {
    color: Colors.inkOnAccent,
  },
  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  translateBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  typingRow: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: 4,
  },
  typingText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  quickReplies: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.sm,
  },
  quickChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  quickChipText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brandGreen,
  },
})
