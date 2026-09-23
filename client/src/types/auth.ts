export type Role = 'customer' | 'worker'

export interface User {
  id: string
  phone: string
  role: Role | null
  name: string | null
  photo_url: string | null
  language: string
  created_at: string
  updated_at: string
}

export interface SendOtpResponse {
  sent: boolean
}

export interface VerifyOtpResponse {
  token: string
  user: User
}

export interface CompleteProfileRequest {
  name: string
  role: Role
  language: string
  photo_url?: string
}

export interface CompleteProfileResponse {
  user: User
}

export interface GetMeResponse {
  user: User
}
