import * as apiService from '@/api/apiService'

export type WorkerLandingRoute = '/(worker)/register/personal' | '/(worker)/(tabs)/home'

/** Resolves where a role==='worker' user should land after auth: registration
 * (no workers row yet) or straight to the dashboard — which shows its own
 * pending/rejected wait state inline until the worker is verified. */
export async function resolveWorkerRoute(): Promise<WorkerLandingRoute> {
  try {
    await apiService.getWorkerMe()
    return '/(worker)/(tabs)/home'
  } catch (e: any) {
    if (e?.response?.status === 404) return '/(worker)/register/personal'
    throw e
  }
}
