export interface CreateReviewRequest {
  booking_id: string
  rating: number
  comment?: string
  tags?: string[]
}
