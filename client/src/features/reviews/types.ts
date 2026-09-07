export type ReviewStatus = 'visible' | 'hidden'

export interface Review {
  id: string
  productId: string
  productName: string
  author: string
  rating: number
  content: string
  status: ReviewStatus
  createdAt: string
}
