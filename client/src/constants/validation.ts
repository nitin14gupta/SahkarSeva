// Shared bounds for free-text "describe the issue"-style fields across the app.
export const DESCRIPTION_MIN_LENGTH = 15
export const DESCRIPTION_MAX_LENGTH = 500

export const BOOKING_PHOTOS_MIN_COUNT = 2
export const BOOKING_PHOTOS_MAX_COUNT = 12

export function isValidDescription(text: string): boolean {
  const length = text.trim().length
  return length >= DESCRIPTION_MIN_LENGTH && length <= DESCRIPTION_MAX_LENGTH
}
