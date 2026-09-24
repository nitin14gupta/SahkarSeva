import { useEffect, useRef, useState } from 'react'
import Razorpay from 'react-native-customui'

export interface VpaResult {
  name: string
  vpa: string
}

const VPA_FORMAT_REGEX = /^[\w.-]+@[\w]+$/
const DEBOUNCE_MS = 600

/** Verifies a UPI ID is real and registered, and resolves the account holder's
 * name for the user to confirm — via Razorpay's on-device SDK (public key
 * only, no secret involved). The resolved name is for on-screen confirmation
 * only; callers decide whether to persist it. */
export function useVpaValidation(vpa: string, rzpKey: string | null) {
  const [vpaResult, setVpaResult] = useState<VpaResult | null>(null)
  const [vpaError, setVpaError] = useState(false)
  const [checking, setChecking] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initializedRef = useRef(false)

  const validFormat = VPA_FORMAT_REGEX.test(vpa.trim())

  useEffect(() => {
    if (rzpKey && !initializedRef.current) {
      Razorpay.initRazorpay(rzpKey)
      initializedRef.current = true
    }
  }, [rzpKey])

  useEffect(() => {
    let cancelled = false
    if (debounceRef.current) clearTimeout(debounceRef.current)

    ;(async () => {
      setVpaResult(null)
      setVpaError(false)
      if (!validFormat || !initializedRef.current) return

      debounceRef.current = setTimeout(async () => {
        if (cancelled) return
        setChecking(true)
        try {
          const res = await Razorpay.isValidVpa(vpa.trim())
          if (cancelled) return
          const name = res?.customer_name ?? res?.name
          if (name) {
            setVpaResult({ name, vpa: vpa.trim() })
          } else {
            setVpaError(true)
          }
        } catch {
          if (!cancelled) setVpaError(true)
        } finally {
          if (!cancelled) setChecking(false)
        }
      }, DEBOUNCE_MS)
    })()

    return () => {
      cancelled = true
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [vpa, validFormat, rzpKey])

  return { validFormat, checking, vpaResult, vpaError }
}
