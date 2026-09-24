import { create } from 'zustand'

interface BookingDraft {
  workerId: string | null
  category: string | null
  scheduledDate: string | null
  scheduledTime: string | null
  addressId: string | null
  notes: string
  photoUri: string | null
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
  photoUri: null,
}

export const useBookingDraftStore = create<BookingDraftState>((set) => ({
  ...initial,
  setDraft: (partial) => set(partial),
  reset: () => set(initial),
}))
