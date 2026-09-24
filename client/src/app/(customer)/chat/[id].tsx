import { useEffect, useRef, useState } from 'react'
import { FlatList, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Phone, Send } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppHeader, HeaderIconBtn, KeyboardAvoidingWrapper } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { useAuthStore } from '@/store/authStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { BookingDetail, ChatMessage } from '@/types/booking'

const POLL_MS = 4000
const QUICK_REPLIES = ['Thanks!', 'How long will it take?', "I'm at the address", 'Please call me']

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const myUserId = useAuthStore((s) => s.user?.id)
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const listRef = useRef<FlatList>(null)

  useEffect(() => {
    let cancelled = false
    apiService.getBookingDetail(id).then(({ booking }) => { if (!cancelled) setBooking(booking) })
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    let cancelled = false
    async function poll() {
      try {
        const { messages } = await apiService.getMessages(id)
        if (!cancelled) setMessages(messages)
      } catch {
        // silent — next poll retries
      }
    }
    poll()
    const interval = setInterval(poll, POLL_MS)
    return () => { cancelled = true; clearInterval(interval) }
  }, [id])

  async function handleSend(text: string) {
    if (!text.trim()) return
    setDraft('')
    const { message } = await apiService.sendMessage(id, text.trim())
    setMessages((prev) => [...prev, message])
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
            return (
              <View style={[s.bubbleRow, isMe && s.bubbleRowMe]}>
                <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleThem]}>
                  <Text style={[s.bubbleText, isMe && s.bubbleTextMe]}>{item.message}</Text>
                </View>
              </View>
            )
          }}
        />

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
            onChangeText={setDraft}
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
