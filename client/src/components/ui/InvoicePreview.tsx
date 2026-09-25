import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Colors, FontFamily, Radius, Spacing } from '@/constants'

interface InvoicePreviewProps {
  category: string
  customerName: string
  date?: string | null
  amount: number
}

export function InvoicePreview({ category, customerName, date, amount }: InvoicePreviewProps) {
  const { t } = useTranslation('common')
  return (
    <View style={s.card}>
      <Text style={s.title}>{t('invoice.title')}</Text>

      <Row label={t('invoice.customer')} value={customerName} />
      <Row label={t('invoice.service')} value={category} />
      {!!date && <Row label={t('invoice.date')} value={date} />}

      <View style={s.divider} />

      <View style={s.row}>
        <Text style={s.totalLabel}>{t('invoice.total')}</Text>
        <Text style={s.totalValue}>₹{amount}</Text>
      </View>
    </View>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  label: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  value: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    fontFamily: FontFamily.headingBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontFamily: FontFamily.headingBold,
    fontSize: 18,
    color: Colors.brandGreen,
  },
})
