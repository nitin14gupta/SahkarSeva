import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Map, Camera, Marker } from '@maplibre/maplibre-react-native'
import { MapPin } from 'lucide-react-native'
import { Colors, MAP_STYLE_URL } from '@/constants'

interface MapPinPickerProps {
  initialCoords?: { lat: number; lng: number }
  onPick: (coords: { lat: number; lng: number }) => void
  height?: number
}

const DEFAULT_COORDS = { lat: 12.9716, lng: 77.5946 }

export function MapPinPicker({ initialCoords, onPick, height = 220 }: MapPinPickerProps) {
  const [coords, setCoords] = useState(initialCoords ?? DEFAULT_COORDS)

  function handlePress(event: { nativeEvent: { lngLat: [number, number] } }) {
    const [lng, lat] = event.nativeEvent.lngLat
    const next = { lat, lng }
    setCoords(next)
    onPick(next)
  }

  return (
    <View style={[s.wrap, { height }]}>
      <Map style={s.map} mapStyle={MAP_STYLE_URL} onPress={handlePress}>
        <Camera center={[coords.lng, coords.lat]} zoom={14} />
        <Marker lngLat={[coords.lng, coords.lat]}>
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
})
