import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import * as apiService from '@/api/apiService'

const MAX_DIMENSION = 512
const WEBP_COMPRESS_QUALITY = 0.7

/** Picks an image, resizes + re-encodes it to WebP, uploads to R2, and returns
 * both a local preview URI (instant) and the eventual remote URL. */
export function useImageUpload(folder: string) {
  const [uploading, setUploading] = useState(false)

  async function pickAndUpload(): Promise<{ localUri: string; remoteUrl: string } | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })
    if (result.canceled) return null

    setUploading(true)
    try {
      const context = ImageManipulator.manipulate(result.assets[0].uri)
      context.resize({ width: MAX_DIMENSION, height: MAX_DIMENSION })
      const rendered = await context.renderAsync()
      const compressed = await rendered.saveAsync({ format: SaveFormat.WEBP, compress: WEBP_COMPRESS_QUALITY })

      const remoteUrl = await apiService.uploadImage(compressed.uri, folder)
      return { localUri: compressed.uri, remoteUrl }
    } finally {
      setUploading(false)
    }
  }

  return { pickAndUpload, uploading }
}
