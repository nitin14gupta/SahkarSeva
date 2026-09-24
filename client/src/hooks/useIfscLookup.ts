import { useEffect, useState } from 'react'

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/

export interface BankInfo {
  bank: string
  branch: string
}

/** The bank + branch are fully determined by the IFSC code — no need to make
 * someone type them in. Razorpay's public IFSC lookup is free, unauthenticated,
 * and needs no backend endpoint of ours at all. */
export function useIfscLookup(ifscCode: string) {
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const validFormat = IFSC_REGEX.test(ifscCode)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setBankInfo(null)
      setError(false)
      if (!validFormat) return

      setLoading(true)
      try {
        const res = await fetch(`https://ifsc.razorpay.com/${ifscCode}`)
        if (!res.ok) throw new Error('not found')
        const data = await res.json()
        if (!cancelled) setBankInfo({ bank: data.BANK, branch: data.BRANCH })
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [ifscCode, validFormat])

  return { validFormat, loading, bankInfo, error }
}
