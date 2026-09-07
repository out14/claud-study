import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteInquiry, getInquiries, updateInquiry } from './api'
import type { Inquiry } from './types'

export const inquiriesQueryKey = ['inquiries'] as const

export function useInquiriesQuery() {
  return useQuery({ queryKey: inquiriesQueryKey, queryFn: getInquiries })
}

export function useAnswerInquiryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, answerContent }: { id: string; answerContent: string | null }) =>
      updateInquiry(id, { answerContent }),
    onSuccess: (updated) => {
      queryClient.setQueryData<Inquiry[]>(inquiriesQueryKey, (prev) =>
        prev?.map((inquiry) => (inquiry.id === updated.id ? updated : inquiry)),
      )
    },
  })
}

export function useDeleteInquiryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteInquiry(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Inquiry[]>(inquiriesQueryKey, (prev) =>
        prev?.filter((inquiry) => inquiry.id !== id),
      )
    },
  })
}
