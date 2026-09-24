export interface SupportTicket {
  id: string
  user_id: string
  booking_id: string | null
  subject: string
  message: string
  status: 'open' | 'resolved'
  created_at: string
}

export interface CreateTicketRequest {
  subject: string
  message: string
  booking_id?: string
}
