import { apiFetch, mockDelay, USE_MOCK_API } from '@src/api/client'
import { INITIAL_PRODUCTS } from './mockProducts'
import type { Product } from './types'

let mockProducts = INITIAL_PRODUCTS.map((product) => ({ ...product }))

type ProductInput = Omit<Product, 'id' | 'createdAt'>

function createProductId(): string {
  return `prod-${Date.now()}`
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

async function getProductsMock(): Promise<Product[]> {
  await mockDelay()
  return mockProducts.map((product) => ({ ...product }))
}

async function createProductMock(input: ProductInput): Promise<Product> {
  await mockDelay()
  const created: Product = { ...input, id: createProductId(), createdAt: today() }
  mockProducts = [created, ...mockProducts]
  return created
}

async function updateProductMock(id: string, updates: Partial<Product>): Promise<Product> {
  await mockDelay()
  mockProducts = mockProducts.map((product) =>
    product.id === id ? { ...product, ...updates } : product,
  )

  const updated = mockProducts.find((product) => product.id === id)
  if (!updated) throw new Error('상품을 찾을 수 없습니다.')
  return updated
}

async function deleteProductMock(id: string): Promise<void> {
  await mockDelay()
  mockProducts = mockProducts.filter((product) => product.id !== id)
}

function getProductsRequest(): Promise<Product[]> {
  return apiFetch<Product[]>('/products')
}

function createProductRequest(input: ProductInput): Promise<Product> {
  return apiFetch<Product>('/products', { method: 'POST', json: input })
}

function updateProductRequest(id: string, updates: Partial<Product>): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, { method: 'PATCH', json: updates })
}

function deleteProductRequest(id: string): Promise<void> {
  return apiFetch<void>(`/products/${id}`, { method: 'DELETE' })
}

export function getProducts(): Promise<Product[]> {
  return USE_MOCK_API ? getProductsMock() : getProductsRequest()
}

export function createProduct(input: ProductInput): Promise<Product> {
  return USE_MOCK_API ? createProductMock(input) : createProductRequest(input)
}

export function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  return USE_MOCK_API ? updateProductMock(id, updates) : updateProductRequest(id, updates)
}

export function deleteProduct(id: string): Promise<void> {
  return USE_MOCK_API ? deleteProductMock(id) : deleteProductRequest(id)
}
