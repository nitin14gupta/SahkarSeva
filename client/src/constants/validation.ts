// Shared bounds for free-text "describe the issue"-style fields across the app.
export const DESCRIPTION_MIN_LENGTH = 15
export const DESCRIPTION_MAX_LENGTH = 500

export const BOOKING_PHOTOS_MIN_COUNT = 2
export const BOOKING_PHOTOS_MAX_COUNT = 12

export function isValidDescription(text: string): boolean {
  const length = text.trim().length
  return length >= DESCRIPTION_MIN_LENGTH && length <= DESCRIPTION_MAX_LENGTH
}

// This file exports plain constants, not components, so it cannot call
// useTranslation() itself. These are i18next KEYS (in the `common`
// namespace) for the validation-hint copy built from the bounds above —
// callers must run them through t(key, { ...params }) at display time.
export const DESCRIPTION_LENGTH_HINT_KEY = 'validation.descriptionLengthHint'
export const PHOTOS_COUNT_HINT_KEY = 'validation.photosCountHint'
