import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Map, Camera, Marker } from '@maplibre/maplibre-react-native'
import { MapPin } from 'lucide-react-native'
import { Colors, DEFAULT_MAP_CENTER, MAP_STYLE_URL } from '@/constants'
import { useCurrentLocation } from '@/hooks/useCurrentLocation'

interface MapPinPickerProps {
  initialCoords?: { lat: number; lng: number }
  onPick: (coords: { lat: number; lng: number }) => void
  height?: number
}

export function MapPinPicker({ initialCoords, onPick, height = 220 }: MapPinPickerProps) {
  const { lat, lng } = useCurrentLocation()
  const [coords, setCoords] = useState(initialCoords ?? null)

  // Once a live GPS fix arrives, use it as the starting pin position — but
  // only if the caller didn't already pass one and the user hasn't tapped yet.
  useEffect(() => {
    if (coords || initialCoords || lat == null || lng == null) return
    ;(async () => {
      const next = { lat, lng }
      setCoords(next)
      onPick(next)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the live fix itself changes
  }, [lat, lng])

  function handlePress(event: { nativeEvent: { lngLat: [number, number] } }) {
    const [lng, lat] = event.nativeEvent.lngLat
    const next = { lat, lng }
    setCoords(next)
    onPick(next)
  }

  const pin = coords ?? DEFAULT_MAP_CENTER

  return (
    <View style={[s.wrap, { height }]}>
      <Map style={s.map} mapStyle={MAP_STYLE_URL} onPress={handlePress} logo={false} attribution={false}>
        <Camera center={[pin.lng, pin.lat]} zoom={14} />
        {lat != null && lng != null && (
          <Marker lngLat={[lng, lat]} anchor="center">
            <View style={s.liveDot} />
          </Marker>
        )}
        <Marker lngLat={[pin.lng, pin.lat]}>
          <MapPin size={28} color={Colors.terracotta} fill={Colors.terracotta} strokeWidth={1.5} />
        </Marker>
      </Map>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  liveDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
})
