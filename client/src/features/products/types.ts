export interface Product {
  id: string
  name: string
  thumbnailUrl?: string
  detailImageUrls: string[]
  origin: string
  description: string
  manufacturedAt: string
  expiresAt: string
  price1: number
  price10: number
  price50: number
  price100: number
  visibility: 'visible' | 'hidden'
  createdAt: string
}
