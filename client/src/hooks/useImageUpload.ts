import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import * as apiService from '@/api/apiService'

const MAX_DIMENSION = 512
const WEBP_COMPRESS_QUALITY = 0.7

async function processAndUpload(
  uri: string,
  folder: string,
  resize: { width: number; height?: number }
): Promise<{ localUri: string; remoteUrl: string }> {
  const context = ImageManipulator.manipulate(uri)
  context.resize(resize)
  const rendered = await context.renderAsync()
  const compressed = await rendered.saveAsync({ format: SaveFormat.WEBP, compress: WEBP_COMPRESS_QUALITY })

  const remoteUrl = await apiService.uploadImage(compressed.uri, folder)
  return { localUri: compressed.uri, remoteUrl }
}

/** Picks image(s), resizes + re-encodes to WebP, uploads to R2, and returns
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
      // Already square-cropped by the picker's editor, so resize both dimensions.
      return await processAndUpload(result.assets[0].uri, folder, { width: MAX_DIMENSION, height: MAX_DIMENSION })
    } finally {
      setUploading(false)
    }
  }

  /** Picks up to `maxCount` images at once (no crop — multi-select and editing
   * are mutually exclusive in expo-image-picker) and uploads all of them. */
  async function pickMultipleAndUpload(maxCount: number): Promise<{ localUri: string; remoteUrl: string }[]> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: maxCount,
      quality: 1,
    })
    if (result.canceled) return []

    setUploading(true)
    try {
      // Width-only resize preserves each photo's own aspect ratio.
      return await Promise.all(result.assets.map((a) => processAndUpload(a.uri, folder, { width: MAX_DIMENSION })))
    } finally {
      setUploading(false)
    }
  }

  return { pickAndUpload, pickMultipleAndUpload, uploading }
}
