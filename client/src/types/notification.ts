export interface AppNotification {
  id: string
  title: string
  body: string | null
  type: string
  booking_id: string | null
  is_read: boolean
  created_at: string
}
