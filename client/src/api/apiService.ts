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
} from '@/types/booking'
import type { Category, WorkerDetail, WorkerSearchParams, WorkerSummary } from '@/types/catalog'
import type { Address, CreateAddressRequest } from '@/types/address'
import type { Payment, PaymentHistoryItem, PaymentMethod, PaymentMethodType, VerifyPaymentParams } from '@/types/payment'
import type { CreateReviewRequest } from '@/types/review'
import type { CreateTicketRequest, SupportTicket } from '@/types/support'

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
