import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUsers, updateUser } from './api'
import type { AppUser } from './types'

export const usersQueryKey = ['users'] as const

export function useUsersQuery() {
  return useQuery({ queryKey: usersQueryKey, queryFn: getUsers })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AppUser> }) =>
      updateUser(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData<AppUser[]>(usersQueryKey, (prev) =>
        prev?.map((user) => (user.id === updated.id ? updated : user)),
      )
    },
  })
}
