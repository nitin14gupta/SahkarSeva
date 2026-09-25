import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { AppHeader, EmptyState } from '@/components/ui'
import * as apiService from '@/api/apiService'
import { usePillStore } from '@/store/pillStore'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'
import type { Address } from '@/types/address'

export default function AddressesScreen() {
  const { t } = useTranslation('customer')
  const show = usePillStore((s) => s.show)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      ;(async () => {
        setLoading(true)
        try {
          const { addresses } = await apiService.getAddresses()
          if (!cancelled) setAddresses(addresses)
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
      return () => { cancelled = true }
    }, [])
  )

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const { addresses } = await apiService.getAddresses()
      setAddresses(addresses)
    } catch {
      // keep whatever was already showing — the pull gesture retrying silently is fine
    } finally {
      setRefreshing(false)
    }
  }

  async function handleDelete(id: string) {
    const previous = addresses
    setAddresses((prev) => prev.filter((a) => a.id !== id))
    try {
      await apiService.deleteAddress(id)
    } catch (e: any) {
      setAddresses(previous)
      show(e?.response?.data?.detail ?? t('addresses.deleteError'), 'error')
    }
  }

  return (
    <View style={s.container}>
      <AppHeader title={t('addresses.title')} showBack />

      {loading ? (
        <View style={s.center}><ActivityIndicator color={Colors.brandGreen} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={s.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.brandGreen]} tintColor={Colors.brandGreen} />}
        >
          {addresses.length === 0 ? (
            <EmptyState icon={MapPin} title={t('addresses.emptyTitle')} />
          ) : (
            addresses.map((addr) => (
              <View key={addr.id} style={s.addressCard}>
                <MapPin size={18} color={Colors.textSecondary} strokeWidth={2} />
                <View style={{ flex: 1 }}>
                  <Text style={s.addressLabel}>{addr.label}</Text>
                  <Text style={s.addressLine} numberOfLines={2}>
                    {[addr.line1, addr.line2, addr.city, addr.state].filter(Boolean).join(', ')}
                    {addr.pincode ? ` — ${addr.pincode}` : ''}
                  </Text>
                </View>
                <Pressable onPress={() => router.push({ pathname: '/addresses/form', params: { id: addr.id } })} hitSlop={8} style={{ marginRight: Spacing.md }}>
                  <Pencil size={16} color={Colors.textSecondary} strokeWidth={2} />
                </Pressable>
                <Pressable onPress={() => handleDelete(addr.id)} hitSlop={8}>
                  <Trash2 size={16} color={Colors.destructive} strokeWidth={2} />
                </Pressable>
              </View>
            ))
          )}

          <Pressable style={s.addNew} onPress={() => router.push('/addresses/form')}>
            <Plus size={16} color={Colors.brandGreen} strokeWidth={2} />
            <Text style={s.addNewText}>{t('addresses.addNew')}</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.sm,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  addressLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  addressLine: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  addNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
  },
  addNewText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
    color: Colors.brandGreen,
  },
})
