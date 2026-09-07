import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProduct, deleteProduct, getProducts, updateProduct } from './api'
import type { Product } from './types'

export const productsQueryKey = ['products'] as const

export function useProductsQuery() {
  return useQuery({ queryKey: productsQueryKey, queryFn: getProducts })
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Omit<Product, 'id' | 'createdAt'>) => createProduct(input),
    onSuccess: (created) => {
      queryClient.setQueryData<Product[]>(productsQueryKey, (prev) =>
        prev ? [created, ...prev] : [created],
      )
    },
  })
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) =>
      updateProduct(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData<Product[]>(productsQueryKey, (prev) =>
        prev?.map((product) => (product.id === updated.id ? updated : product)),
      )
    },
  })
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Product[]>(productsQueryKey, (prev) =>
        prev?.filter((product) => product.id !== id),
      )
    },
  })
}
