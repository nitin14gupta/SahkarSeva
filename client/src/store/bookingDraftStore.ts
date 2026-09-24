import { create } from 'zustand'

export interface BookingDraftPhoto {
  localUri: string
  remoteUrl: string
}

interface BookingDraft {
  workerId: string | null
  category: string | null
  scheduledDate: string | null
  scheduledTime: string | null
  addressId: string | null
  notes: string
  photos: BookingDraftPhoto[]
}

interface BookingDraftState extends BookingDraft {
  setDraft: (partial: Partial<BookingDraft>) => void
  reset: () => void
}

const initial: BookingDraft = {
  workerId: null,
  category: null,
  scheduledDate: null,
  scheduledTime: null,
  addressId: null,
  notes: '',
  photos: [],
}

export const useBookingDraftStore = create<BookingDraftState>((set) => ({
  ...initial,
  setDraft: (partial) => set(partial),
  reset: () => set(initial),
}))
