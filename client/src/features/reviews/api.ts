import { apiFetch, mockDelay, USE_MOCK_API } from '@src/api/client'
import { INITIAL_REVIEWS } from './mockReviews'
import type { Review } from './types'

let mockReviews = INITIAL_REVIEWS.map((review) => ({ ...review }))

async function getReviewsMock(): Promise<Review[]> {
  await mockDelay()
  return mockReviews.map((review) => ({ ...review }))
}

async function updateReviewMock(id: string, updates: Partial<Review>): Promise<Review> {
  await mockDelay()
  mockReviews = mockReviews.map((review) =>
    review.id === id ? { ...review, ...updates } : review,
  )

  const updated = mockReviews.find((review) => review.id === id)
  if (!updated) throw new Error('리뷰를 찾을 수 없습니다.')
  return updated
}

async function deleteReviewMock(id: string): Promise<void> {
  await mockDelay()
  mockReviews = mockReviews.filter((review) => review.id !== id)
}

function getReviewsRequest(): Promise<Review[]> {
  return apiFetch<Review[]>('/reviews')
}

function updateReviewRequest(id: string, updates: Partial<Review>): Promise<Review> {
  return apiFetch<Review>(`/reviews/${id}`, { method: 'PATCH', json: updates })
}

function deleteReviewRequest(id: string): Promise<void> {
  return apiFetch<void>(`/reviews/${id}`, { method: 'DELETE' })
}

export function getReviews(): Promise<Review[]> {
  return USE_MOCK_API ? getReviewsMock() : getReviewsRequest()
}

export function updateReview(id: string, updates: Partial<Review>): Promise<Review> {
  return USE_MOCK_API ? updateReviewMock(id, updates) : updateReviewRequest(id, updates)
}

export function deleteReview(id: string): Promise<void> {
  return USE_MOCK_API ? deleteReviewMock(id) : deleteReviewRequest(id)
}
