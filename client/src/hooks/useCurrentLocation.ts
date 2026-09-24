import { useEffect, useState } from 'react'
import * as Location from 'expo-location'

/** Live-updating current position (+ compass heading). Shows a cached fix
 * immediately if one exists, then keeps watching for updates while mounted. */
export function useCurrentLocation() {
  const [lat, setLat] = useState<number>()
  const [lng, setLng] = useState<number>()
  const [heading, setHeading] = useState<number>()
  const [status, setStatus] = useState<Location.PermissionStatus>()

  useEffect(() => {
    let posSub: Location.LocationSubscription | null = null
    let headingSub: Location.LocationSubscription | null = null
    let cancelled = false

    ;(async () => {
      const perm = await Location.requestForegroundPermissionsAsync()
      if (cancelled) return
      setStatus(perm.status)
      if (perm.status !== 'granted') return

      const last = await Location.getLastKnownPositionAsync()
      if (!cancelled && last) {
        setLat(last.coords.latitude)
        setLng(last.coords.longitude)
      }

      posSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 15000, distanceInterval: 25 },
        (position) => {
          setLat(position.coords.latitude)
          setLng(position.coords.longitude)
        },
      )
      if (cancelled) { posSub.remove(); return }

      headingSub = await Location.watchHeadingAsync((event) => {
        const h = event.trueHeading >= 0 ? event.trueHeading : event.magHeading
        setHeading(h)
      })
      if (cancelled) headingSub.remove()
    })()

    return () => {
      cancelled = true
      posSub?.remove()
      headingSub?.remove()
    }
  }, [])

  return { lat, lng, heading, status }
}
