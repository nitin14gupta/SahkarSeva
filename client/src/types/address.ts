export interface Address {
  id: string
  user_id: string
  label: string
  line1: string
  line2: string | null
  city: string | null
  state: string | null
  pincode: string | null
  lat: number | null
  lng: number | null
  is_default: boolean
  created_at: string
}

export interface CreateAddressRequest {
  label: string
  line1: string
  line2?: string
  city?: string
  state?: string
  pincode?: string
  lat?: number
  lng?: number
  is_default?: boolean
}
