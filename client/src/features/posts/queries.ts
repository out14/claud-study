import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPost, deletePost, getPosts, updatePost } from './api'
import type { Post } from './types'

export const postsQueryKey = ['posts'] as const

export function usePostsQuery() {
  return useQuery({ queryKey: postsQueryKey, queryFn: getPosts })
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Omit<Post, 'id' | 'createdAt'>) => createPost(input),
    onSuccess: (created) => {
      queryClient.setQueryData<Post[]>(postsQueryKey, (prev) =>
        prev ? [created, ...prev] : [created],
      )
    },
  })
}

export function useUpdatePostMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Post> }) =>
      updatePost(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData<Post[]>(postsQueryKey, (prev) =>
        prev?.map((post) => (post.id === updated.id ? updated : post)),
      )
    },
  })
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Post[]>(postsQueryKey, (prev) =>
        prev?.filter((post) => post.id !== id),
      )
    },
  })
}
