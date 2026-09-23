// 8px linear scale — all spacing derives from this base.
// Values are SahkarSeva defaults (not carried over from another app) —
// tune once real design specs exist.
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  screenPadding: 24,
  sectionGap: 18,
  gutter: 12,
} as const

export const Radius = {
  sm: 8,
  input: 12,
  inputLg: 14,
  card: 16,
  modal: 28,
  pill: 999,
} as const

export const ComponentSize = {
  btnPrimary: 56,
  btnGhost: 44,
  inputHeight: 52,
  inputPhoneHeight: 62,
  otpBoxHeight: 52,
  backBtn: 40,
  navBar: 72,
} as const
