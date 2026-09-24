import React from 'react'
import {
  Zap, Wrench, Hammer, Paintbrush, Home as HomeIcon, HeartHandshake,
  Car, Sprout, Sparkles, Settings, type LucideIcon,
} from 'lucide-react-native'
import { Colors } from '@/constants'

const ICONS: Record<string, LucideIcon> = {
  Zap, Wrench, Hammer, Paintbrush, Home: HomeIcon, HeartHandshake,
  Car, Sprout, Sparkles, Settings,
}

interface CategoryIconProps {
  name: string
  size?: number
  color?: string
}

export function CategoryIcon({ name, size = 24, color = Colors.brandGreen }: CategoryIconProps) {
  const Icon = ICONS[name] ?? Wrench
  return <Icon size={size} color={color} strokeWidth={2} />
}
