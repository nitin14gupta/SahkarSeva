import { create } from 'zustand'
import type { RegisterWorkerDocumentInput } from '@/types/worker'

interface WorkerRegistrationDraft {
  idNumber: string
  addressLine1: string
  lat: number | null
  lng: number | null
  cooperativeId: string | null
  categories: string[]
  yearsExperience: number
  priceMin: number | null
  priceMax: number | null
  documents: RegisterWorkerDocumentInput[]
}

interface WorkerRegistrationDraftState extends WorkerRegistrationDraft {
  setDraft: (partial: Partial<WorkerRegistrationDraft>) => void
  reset: () => void
}

const initial: WorkerRegistrationDraft = {
  idNumber: '',
  addressLine1: '',
  lat: null,
  lng: null,
  cooperativeId: null,
  categories: [],
  yearsExperience: 0,
  priceMin: null,
  priceMax: null,
  documents: [],
}

export const useWorkerRegistrationDraftStore = create<WorkerRegistrationDraftState>((set) => ({
  ...initial,
  setDraft: (partial) => set(partial),
  reset: () => set(initial),
}))
