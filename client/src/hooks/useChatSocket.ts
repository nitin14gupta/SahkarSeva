import { useCallback, useEffect, useRef, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { API_BASE_URL } from '@/api/config'
import * as apiService from '@/api/apiService'
import { CacheKeys } from '@/constants'
import type { ChatMessage } from '@/types/booking'

const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws')
const TYPING_IDLE_MS = 4000

/** Realtime booking chat over a single WebSocket, with a REST fallback for
 * sending when the socket isn't currently open (no reconnect/backoff logic —
 * a fresh connection is made per screen visit, which is enough for a chat
 * tied to one active booking). */
export function useChatSocket(bookingId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [partnerTyping, setPartnerTyping] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const { messages } = await apiService.getMessages(bookingId)
        if (!cancelled) setMessages(messages)
      } catch {
        // history load failure is non-fatal — the socket may still deliver new messages
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [bookingId])

  useEffect(() => {
    let cancelled = false
    let ws: WebSocket | null = null

    ;(async () => {
      const token = await SecureStore.getItemAsync(CacheKeys.authToken)
      if (!token || cancelled) return

      ws = new WebSocket(`${WS_BASE_URL}/ws/chat/${bookingId}?token=${token}`)
      wsRef.current = ws

      ws.onopen = () => {
        if (cancelled) return
        setConnected(true)
        ws?.send(JSON.stringify({ type: 'read' }))
      }
      ws.onclose = () => { if (!cancelled) setConnected(false) }
      ws.onerror = () => { if (!cancelled) setConnected(false) }
      ws.onmessage = (event) => {
        if (cancelled) return
        const data = JSON.parse(event.data)
        if (data.type === 'message') {
          setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data]))
        } else if (data.type === 'typing') {
          setPartnerTyping(!!data.is_typing)
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          if (data.is_typing) {
            typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), TYPING_IDLE_MS)
          }
        }
      }
    })()

    return () => {
      cancelled = true
      ws?.close()
      wsRef.current = null
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [bookingId])

  const sendMessage = useCallback(async (text: string) => {
    const content = text.trim()
    if (!content) return
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'message', content }))
    } else {
      const { message } = await apiService.sendMessage(bookingId, content)
      setMessages((prev) => [...prev, message])
    }
  }, [bookingId])

  const setTyping = useCallback((isTyping: boolean) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'typing', is_typing: isTyping }))
    }
  }, [])

  return { messages, loading, connected, partnerTyping, sendMessage, setTyping }
}
