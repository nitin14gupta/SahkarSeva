export type VerificationStatus = 'pending' | 'verified' | 'rejected'
export type PayoutSchedule = 'daily' | 'weekly' | 'monthly'
export type WorkerDocumentType = 'id_proof' | 'skill_certificate'

export interface WorkerDocument {
  id: string
  doc_type: WorkerDocumentType
  url: string
  label: string | null
  created_at: string
}

export interface WorkerProfile {
  id: string
  user_id: string
  cooperative_id: string | null
  cooperative_name: string | null
  bio: string | null
  years_experience: number
  price_min: number | null
  price_max: number | null
  rating_avg: number
  rating_count: number
  is_online: boolean
  verification_status: VerificationStatus
  verification_reason: string | null
  id_number: string | null
  payout_schedule: PayoutSchedule
  lat: number | null
  lng: number | null
  categories: string[]
  created_at: string
}

export interface Cooperative {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  verified_since: string | null
}

export interface RegisterWorkerDocumentInput {
  doc_type: WorkerDocumentType
  url: string
  label?: string
}

export interface RegisterWorkerRequest {
  id_number?: string
  cooperative_id?: string
  categories: string[]
  years_experience?: number
  price_min?: number
  price_max?: number
  bio?: string
  lat?: number
  lng?: number
  documents?: RegisterWorkerDocumentInput[]
}

export interface UpdateWorkerRequest {
  bio?: string
  years_experience?: number
  price_min?: number
  price_max?: number
  payout_schedule?: PayoutSchedule
}

export interface WorkerDashboardSummary {
  is_online: boolean
  verification_status: VerificationStatus
  rating_avg: number
  rating_count: number
  today_job_count: number
  today_earnings: number
}

export interface WorkerAvailabilitySlot {
  id: string
  worker_id: string
  slot_date: string
  start_time: string
  end_time: string
  is_booked: boolean
}

export type EarningsRange = 'daily' | 'weekly' | 'monthly'

export interface EarningsBucket {
  period: string
  jobs: number
  gross: number
  commission: number
  net: number
}

export interface EarningsSummary {
  range: EarningsRange
  commission_pct: number
  today_earnings: number
  total_jobs: number
  total_gross: number
  total_commission: number
  total_net: number
  buckets: EarningsBucket[]
}

export type PayoutMethod = 'bank' | 'upi'

export interface PayoutAccount {
  id: string
  worker_id: string
  method: PayoutMethod
  account_holder: string | null
  account_number: string | null
  ifsc: string | null
  upi_id: string | null
  is_default: boolean
  created_at: string
}

export interface AddPayoutAccountRequest {
  method: PayoutMethod
  account_holder?: string
  account_number?: string
  ifsc?: string
  upi_id?: string
  is_default?: boolean
}

export type WelfareEnrollmentStatus = 'pending' | 'active'

export interface WelfareEnrollment {
  id: string
  worker_id: string
  status: WelfareEnrollmentStatus
  eshram_uan: string | null
  scheme_name: string | null
  enrolled_at: string | null
  created_at: string
}

export type WelfareClaimStatus = 'submitted' | 'under_review' | 'approved' | 'rejected'

export interface WelfareClaim {
  id: string
  worker_id: string
  reason: string
  amount_claimed: number | null
  status: WelfareClaimStatus
  submitted_at: string
  reviewed_at: string | null
  resolved_at: string | null
}
