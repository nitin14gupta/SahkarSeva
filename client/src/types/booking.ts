export type BookingStatus = 'requested' | 'accepted' | 'en_route' | 'in_progress' | 'completed' | 'cancelled'

export interface CreateBookingRequest {
  worker_id: string
  category: string
  address_id?: string
  scheduled_date?: string
  scheduled_time?: string
  notes?: string
  photo_url?: string
  is_emergency?: boolean
}

export interface BookingSummary {
  id: string
  status: BookingStatus
  scheduled_date: string | null
  scheduled_time: string | null
  is_emergency: boolean
  price_estimate: number | null
  notes: string | null
  cancelled_reason: string | null
  created_at: string
  worker_id: string
  worker_name: string
  worker_photo_url: string | null
  category: string
}

export interface BookingDetail extends BookingSummary {
  customer_id: string
  address_id: string | null
  address_line1: string | null
  address_city: string | null
  updated_at: string
}
