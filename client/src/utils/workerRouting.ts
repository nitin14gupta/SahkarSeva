import * as apiService from '@/api/apiService'

export type WorkerLandingRoute =
  | '/(worker)/register/personal'
  | '/(worker)/verification-status'
  | '/(worker)/(tabs)/home'

/** Resolves where a role==='worker' user should land after auth: registration
 * (no workers row yet), the verification gate (row exists but not verified),
 * or straight to the dashboard. */
export async function resolveWorkerRoute(): Promise<WorkerLandingRoute> {
  try {
    const { worker } = await apiService.getWorkerMe()
    return worker.verification_status === 'verified' ? '/(worker)/(tabs)/home' : '/(worker)/verification-status'
  } catch (e: any) {
    if (e?.response?.status === 404) return '/(worker)/register/personal'
    throw e
  }
}
