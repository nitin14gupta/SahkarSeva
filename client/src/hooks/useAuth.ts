import * as SecureStore from 'expo-secure-store'
import * as apiService from '@/api/apiService'
import { CacheKeys } from '@/constants'
import { useAuthStore } from '@/store/authStore'
import type { CompleteProfileRequest } from '@/types/auth'

export function useAuth() {
  const { setSession, setUser, clear } = useAuthStore()

  async function handleSendOTP(phone: string) {
    await apiService.sendOtp(phone)
  }

  async function handleVerifyOTP(phone: string, code: string) {
    const { token, user } = await apiService.verifyOtp(phone, code)
    await SecureStore.setItemAsync(CacheKeys.authToken, token)
    setSession(user, token)
    return user
  }

  async function handleCompleteProfile(body: CompleteProfileRequest) {
    const { user } = await apiService.completeProfile(body)
    setUser(user)
    return user
  }

  async function handleLogout() {
    await SecureStore.deleteItemAsync(CacheKeys.authToken)
    clear()
  }

  /** Restores a session from a token already in SecureStore (app cold start). Returns the user, or null if there's no valid session. */
  async function restoreSession() {
    const token = await SecureStore.getItemAsync(CacheKeys.authToken)
    if (!token) return null
    try {
      const { user } = await apiService.getMe()
      setSession(user, token)
      return user
    } catch {
      await SecureStore.deleteItemAsync(CacheKeys.authToken)
      return null
    }
  }

  return {
    handleSendOTP,
    handleVerifyOTP,
    handleCompleteProfile,
    handleLogout,
    restoreSession,
  }
}
