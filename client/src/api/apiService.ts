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
import type { BookingSummary, BookingStatus, BookingDetail, CreateBookingRequest } from '@/types/booking'
import type { Category, WorkerDetail, WorkerSearchParams, WorkerSummary } from '@/types/catalog'
import type { Address, CreateAddressRequest } from '@/types/address'
import type { Payment, PaymentMethod, PaymentMethodType, VerifyPaymentParams } from '@/types/payment'
import type { CreateReviewRequest } from '@/types/review'

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

export async function getBookings(status?: BookingStatus): Promise<{ bookings: BookingSummary[] }> {
  const { data } = await apiClient.get('/bookings', { params: status ? { status } : {} })
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

export async function deleteAddress(id: string): Promise<{ deleted: boolean }> {
  const { data } = await apiClient.delete(`/addresses/${id}`)
  return data
}

export async function getPaymentMethods(): Promise<{ methods: PaymentMethod[] }> {
  const { data } = await apiClient.get('/payments/methods')
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
