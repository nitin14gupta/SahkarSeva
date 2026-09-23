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
