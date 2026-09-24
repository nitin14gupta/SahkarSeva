export type BookingStatus = 'requested' | 'accepted' | 'en_route' | 'in_progress' | 'completed' | 'cancelled'
export type BookingGroup = 'upcoming' | 'past' | 'cancelled'

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

export interface CreateEmergencyBookingRequest {
  category: string
  lat: number
  lng: number
  address_id?: string
}

export interface BookingDetail extends BookingSummary {
  customer_id: string
  address_id: string | null
  address_line1: string | null
  address_city: string | null
  cooperative_name: string | null
  worker_phone: string
  updated_at: string
}

export interface EmergencyBookingResult {
  id: string
  worker_id: string
  distance_km: number
}

export interface ChatMessage {
  id: string
  sender_id: string
  message: string
  created_at: string
}

export type WorkerBookingGroup = 'incoming' | 'active' | 'history'

export interface WorkerBookingSummary {
  id: string
  status: BookingStatus
  scheduled_date: string | null
  scheduled_time: string | null
  is_emergency: boolean
  price_estimate: number | null
  notes: string | null
  created_at: string
  customer_name: string
  customer_photo_url: string | null
  category: string
  address_line1: string | null
  address_city: string | null
}

export interface WorkerBookingDetail extends WorkerBookingSummary {
  customer_id: string
  customer_phone: string | null
  address_id: string | null
  address_lat: number | null
  address_lng: number | null
  cancelled_reason: string | null
  before_photo_url: string | null
  after_photo_url: string | null
  final_amount: number | null
  completion_confirmed_at: string | null
  updated_at: string
}
