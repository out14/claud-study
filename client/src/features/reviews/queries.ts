import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteReview, getReviews, updateReview } from './api'
import type { Review } from './types'

export const reviewsQueryKey = ['reviews'] as const

export function useReviewsQuery() {
  return useQuery({ queryKey: reviewsQueryKey, queryFn: getReviews })
}

export function useUpdateReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Review> }) =>
      updateReview(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData<Review[]>(reviewsQueryKey, (prev) =>
        prev?.map((review) => (review.id === updated.id ? updated : review)),
      )
    },
  })
}

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Review[]>(reviewsQueryKey, (prev) =>
        prev?.filter((review) => review.id !== id),
      )
    },
  })
}
