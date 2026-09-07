export interface Inquiry {
  id: string
  productId: string
  productName: string
  productThumbnailUrl?: string
  author: string
  isSecret: boolean
  content: string
  answerContent: string | null
  createdAt: string
  answeredAt: string | null
}
