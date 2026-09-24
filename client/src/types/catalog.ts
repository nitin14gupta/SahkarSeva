export interface Category {
  id: string
  name: string
  icon: string
}

export interface WorkerSummary {
  id: string
  name: string
  photo_url: string | null
  bio: string | null
  years_experience: number
  price_min: number | null
  price_max: number | null
  rating_avg: number
  rating_count: number
  is_online: boolean
  lat: number | null
  lng: number | null
  cooperative_name: string | null
  categories: string[]
  distance_km?: number
}

export interface Review {
  rating: number
  comment: string | null
  tags: string[] | null
  created_at: string
  customer_name: string
}

export interface AvailabilitySlot {
  id: string
  slot_date: string
  start_time: string
  end_time: string
}

export interface WorkerDetail extends WorkerSummary {
  reviews: Review[]
  availability: AvailabilitySlot[]
}

export interface WorkerSearchParams {
  q?: string
  category?: string
  min_rating?: number
  available_today?: boolean
  max_price?: number
  radius_km?: number
  lat?: number
  lng?: number
}
