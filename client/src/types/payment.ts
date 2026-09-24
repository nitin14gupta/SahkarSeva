export type PaymentMethodType = 'upi' | 'card' | 'wallet'

export interface PaymentMethod {
  id: string
  user_id: string
  type: PaymentMethodType
  upi_id: string | null
  card_last4: string | null
  card_brand: string | null
  is_default: boolean
  created_at: string
}

export interface Payment {
  id: string
  booking_id: string
  amount: number
  method: PaymentMethodType
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  status: 'pending' | 'success' | 'failed'
  created_at: string
  checkout_url?: string
}

export interface PaymentHistoryItem extends Payment {
  category: string
  worker_name: string
}

export interface VerifyPaymentParams {
  razorpay_payment_link_id: string
  razorpay_payment_link_reference_id: string
  razorpay_payment_link_status: string
  razorpay_payment_id: string
  razorpay_signature: string
}
