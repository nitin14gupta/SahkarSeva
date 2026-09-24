import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { API_BASE_URL } from './config'
import { CacheKeys } from '@/constants'
import type {
  CompleteProfileRequest,
  CompleteProfileResponse,
  GetMeResponse,
  SendOtpResponse,
  VerifyOtpResponse,
} from '@/types/auth'
import type {
  BookingSummary,
  BookingStatus,
  BookingGroup,
  BookingDetail,
  ChatMessage,
  CreateBookingRequest,
  CreateEmergencyBookingRequest,
  EmergencyBookingResult,
  WorkerBookingGroup,
  WorkerBookingSummary,
  WorkerBookingDetail,
} from '@/types/booking'
import type { Category, WorkerDetail, WorkerSearchParams, WorkerSummary } from '@/types/catalog'
import type { Address, CreateAddressRequest } from '@/types/address'
import type { Payment, PaymentHistoryItem, PaymentMethod, PaymentMethodType, VerifyPaymentParams } from '@/types/payment'
import type { AppNotification } from '@/types/notification'
import type { CreateReviewRequest } from '@/types/review'
import type { CreateTicketRequest, SupportTicket } from '@/types/support'
import type {
  AddPayoutAccountRequest,
  Cooperative,
  EarningsRange,
  EarningsSummary,
  PayoutAccount,
  RegisterWorkerDocumentInput,
  RegisterWorkerRequest,
  UpdateWorkerRequest,
  WelfareClaim,
  WelfareEnrollment,
  WorkerAvailabilitySlot,
  WorkerDashboardSummary,
  WorkerDocument,
  WorkerProfile,
  WorkerReview,
} from '@/types/worker'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(CacheKeys.authToken)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function sendOtp(phone: string): Promise<SendOtpResponse> {
  const { data } = await apiClient.post<SendOtpResponse>('/auth/otp/send', { phone })
  return data
}

export async function verifyOtp(phone: string, code: string): Promise<VerifyOtpResponse> {
  const { data } = await apiClient.post<VerifyOtpResponse>('/auth/otp/verify', { phone, code })
  return data
}

export async function completeProfile(
  body: CompleteProfileRequest
): Promise<CompleteProfileResponse> {
  const { data } = await apiClient.post<CompleteProfileResponse>('/auth/profile', body)
  return data
}

export async function getMe(): Promise<GetMeResponse> {
  const { data } = await apiClient.get<GetMeResponse>('/auth/me')
  return data
}

export async function getCategories(): Promise<{ categories: Category[] }> {
  const { data } = await apiClient.get('/categories')
  return data
}

export async function getWorkers(params: WorkerSearchParams = {}): Promise<{ workers: WorkerSummary[] }> {
  const { data } = await apiClient.get('/workers', { params })
  return data
}

export async function getWorkerDetail(id: string): Promise<{ worker: WorkerDetail }> {
  const { data } = await apiClient.get(`/workers/${id}`)
  return data
}

export async function getCooperatives(): Promise<{ cooperatives: Cooperative[] }> {
  const { data } = await apiClient.get('/cooperatives')
  return data
}

export async function getWorkerMe(): Promise<{ worker: WorkerProfile }> {
  const { data } = await apiClient.get('/worker/me')
  return data
}

export async function registerWorker(body: RegisterWorkerRequest): Promise<{ worker: WorkerProfile }> {
  const { data } = await apiClient.post('/worker/register', body)
  return data
}

export async function updateWorkerProfile(body: UpdateWorkerRequest): Promise<{ worker: WorkerProfile }> {
  const { data } = await apiClient.patch('/worker/me', body)
  return data
}

export async function submitWorkerDocuments(
  documents: RegisterWorkerDocumentInput[]
): Promise<{ documents: WorkerDocument[] }> {
  const { data } = await apiClient.post('/worker/me/documents', { documents })
  return data
}

export async function getWorkerDocuments(): Promise<{ documents: WorkerDocument[] }> {
  const { data } = await apiClient.get('/worker/me/documents')
  return data
}

export async function getWorkerReviews(): Promise<{ reviews: WorkerReview[] }> {
  const { data } = await apiClient.get('/worker/me/reviews')
  return data
}

export async function getWorkerDashboard(): Promise<{ dashboard: WorkerDashboardSummary }> {
  const { data } = await apiClient.get('/worker/me/dashboard')
  return data
}

export async function setWorkerOnline(body: {
  is_online: boolean
  lat?: number
  lng?: number
}): Promise<{ worker: WorkerProfile }> {
  const { data } = await apiClient.post('/worker/me/online', body)
  return data
}

export async function getWorkerAvailability(
  params: { from_date?: string; to_date?: string } = {}
): Promise<{ slots: WorkerAvailabilitySlot[] }> {
  const { data } = await apiClient.get('/worker/me/availability', { params })
  return data
}

export async function addAvailabilitySlot(body: {
  slot_date: string
  start_time: string
  end_time: string
}): Promise<{ slot: WorkerAvailabilitySlot }> {
  const { data } = await apiClient.post('/worker/me/availability', body)
  return data
}

export async function removeAvailabilitySlot(id: string): Promise<{ deleted: boolean }> {
  const { data } = await apiClient.delete(`/worker/me/availability/${id}`)
  return data
}

export async function getWorkerBookings(group?: WorkerBookingGroup): Promise<{ bookings: WorkerBookingSummary[] }> {
  const { data } = await apiClient.get('/bookings/worker', { params: { group } })
  return data
}

export async function getWorkerBookingDetail(id: string): Promise<{ booking: WorkerBookingDetail }> {
  const { data } = await apiClient.get(`/bookings/worker/${id}`)
  return data
}

export async function acceptBooking(id: string): Promise<{ booking: WorkerBookingDetail }> {
  const { data } = await apiClient.post(`/bookings/${id}/accept`)
  return data
}

export async function declineBooking(id: string, reason?: string): Promise<{ booking: WorkerBookingDetail }> {
  const { data } = await apiClient.post(`/bookings/${id}/decline`, { reason })
  return data
}

export async function updateBookingStatus(
  id: string,
  status: 'en_route' | 'in_progress'
): Promise<{ booking: WorkerBookingDetail }> {
  const { data } = await apiClient.post(`/bookings/${id}/status`, { status })
  return data
}

export async function attachBookingPhotos(
  id: string,
  body: { before_photo_url?: string; after_photo_url?: string }
): Promise<{ booking: WorkerBookingDetail }> {
  const { data } = await apiClient.post(`/bookings/${id}/photos`, body)
  return data
}

export async function sendCompletionOtp(id: string): Promise<{ sent: boolean }> {
  const { data } = await apiClient.post(`/bookings/${id}/complete/send-otp`)
  return data
}

export async function getEarningsSummary(range: EarningsRange): Promise<{ summary: EarningsSummary }> {
  const { data } = await apiClient.get('/earnings/summary', { params: { range } })
  return data
}

export async function getPayoutAccounts(): Promise<{ accounts: PayoutAccount[] }> {
  const { data } = await apiClient.get('/worker/payout-accounts')
  return data
}

export async function addPayoutAccount(body: AddPayoutAccountRequest): Promise<{ account: PayoutAccount }> {
  const { data } = await apiClient.post('/worker/payout-accounts', body)
  return data
}

export async function getWelfareEnrollment(): Promise<{ enrollment: WelfareEnrollment | null }> {
  const { data } = await apiClient.get('/welfare/me')
  return data
}

export async function enrollWelfare(body: {
  eshram_uan?: string
  scheme_name?: string
}): Promise<{ enrollment: WelfareEnrollment }> {
  const { data } = await apiClient.post('/welfare/enroll', body)
  return data
}

export async function getWelfareClaims(): Promise<{ claims: WelfareClaim[] }> {
  const { data } = await apiClient.get('/welfare/claims')
  return data
}

export async function createWelfareClaim(body: {
  reason: string
  amount_claimed?: number
}): Promise<{ claim: WelfareClaim }> {
  const { data } = await apiClient.post('/welfare/claims', body)
  return data
}

export async function completeBooking(
  id: string,
  body: { otp_code: string; final_amount: number; after_photo_url?: string }
): Promise<{ booking: WorkerBookingDetail }> {
  const { data } = await apiClient.post(`/bookings/${id}/complete`, body)
  return data
}

export async function getBookings(opts: { status?: BookingStatus; group?: BookingGroup } = {}): Promise<{ bookings: BookingSummary[] }> {
  const { data } = await apiClient.get('/bookings', { params: opts })
  return data
}

export async function getBookingDetail(id: string): Promise<{ booking: BookingDetail }> {
  const { data } = await apiClient.get(`/bookings/${id}`)
  return data
}

export async function createBooking(body: CreateBookingRequest): Promise<{ booking: BookingDetail }> {
  const { data } = await apiClient.post('/bookings', body)
  return data
}

export async function createEmergencyBooking(
  body: CreateEmergencyBookingRequest
): Promise<{ booking: EmergencyBookingResult }> {
  const { data } = await apiClient.post('/bookings/emergency', body)
  return data
}

export async function cancelBooking(id: string, reason?: string): Promise<{ booking: BookingDetail }> {
  const { data } = await apiClient.post(`/bookings/${id}/cancel`, { reason })
  return data
}

export async function getAddresses(): Promise<{ addresses: Address[] }> {
  const { data } = await apiClient.get('/addresses')
  return data
}

export async function createAddress(body: CreateAddressRequest): Promise<{ address: Address }> {
  const { data } = await apiClient.post('/addresses', body)
  return data
}

export async function updateAddress(id: string, body: CreateAddressRequest): Promise<{ address: Address }> {
  const { data } = await apiClient.put(`/addresses/${id}`, body)
  return data
}

export async function deleteAddress(id: string): Promise<{ deleted: boolean }> {
  const { data } = await apiClient.delete(`/addresses/${id}`)
  return data
}

export async function getPaymentPublicKey(): Promise<{ key: string }> {
  const { data } = await apiClient.get('/payments/public-key')
  return data
}

export async function getPaymentMethods(): Promise<{ methods: PaymentMethod[] }> {
  const { data } = await apiClient.get('/payments/methods')
  return data
}

export async function addPaymentMethod(body: {
  type: PaymentMethodType
  upi_id?: string
  card_last4?: string
  card_brand?: string
  is_default?: boolean
}): Promise<{ method: PaymentMethod }> {
  const { data } = await apiClient.post('/payments/methods', body)
  return data
}

export async function createPayment(bookingId: string, method: PaymentMethodType): Promise<{ payment: Payment }> {
  const { data } = await apiClient.post('/payments/create', { booking_id: bookingId, method })
  return data
}

export async function verifyPayment(params: VerifyPaymentParams): Promise<{ payment: Payment }> {
  const { data } = await apiClient.post('/payments/verify', params)
  return data
}

export async function getPaymentForBooking(bookingId: string): Promise<{ payment: Payment }> {
  const { data } = await apiClient.get(`/payments/booking/${bookingId}`)
  return data
}

export async function createReview(body: CreateReviewRequest) {
  const { data } = await apiClient.post('/reviews', body)
  return data
}

export async function getMessages(bookingId: string): Promise<{ messages: ChatMessage[] }> {
  const { data } = await apiClient.get(`/bookings/${bookingId}/messages`)
  return data
}

export async function sendMessage(bookingId: string, message: string): Promise<{ message: ChatMessage }> {
  const { data } = await apiClient.post(`/bookings/${bookingId}/messages`, { message })
  return data
}

export async function getFavorites(): Promise<{ favorites: WorkerSummary[] }> {
  const { data } = await apiClient.get('/favorites')
  return data
}

export async function addFavorite(workerId: string): Promise<{ favorited: boolean }> {
  const { data } = await apiClient.post(`/favorites/${workerId}`)
  return data
}

export async function removeFavorite(workerId: string): Promise<{ favorited: boolean }> {
  const { data } = await apiClient.delete(`/favorites/${workerId}`)
  return data
}

export async function getPayments(): Promise<{ payments: PaymentHistoryItem[] }> {
  const { data } = await apiClient.get('/payments')
  return data
}

export async function createTicket(body: CreateTicketRequest): Promise<{ ticket: SupportTicket }> {
  const { data } = await apiClient.post('/support-tickets', body)
  return data
}

export async function getNotifications(): Promise<{ notifications: AppNotification[] }> {
  const { data } = await apiClient.get('/notifications')
  return data
}

export async function getUnreadNotificationCount(): Promise<{ count: number }> {
  const { data } = await apiClient.get('/notifications/unread-count')
  return data
}

export async function markNotificationRead(id: string): Promise<{ read: boolean }> {
  const { data } = await apiClient.post(`/notifications/${id}/read`)
  return data
}

export async function markAllNotificationsRead(): Promise<{ read: boolean }> {
  const { data } = await apiClient.post('/notifications/read-all')
  return data
}

export async function uploadImage(localUri: string, folder: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', {
    uri: localUri,
    name: 'photo.webp',
    type: 'image/webp',
  } as unknown as Blob)
  formData.append('folder', folder)

  const { data } = await apiClient.post<{ url: string }>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.url
}
