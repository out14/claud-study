import { apiClient, mockDelay, USE_MOCK_API } from '@src/api/client'
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

async function getProductsRequest(): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>('/products')
  return data
}

async function createProductRequest(input: ProductInput): Promise<Product> {
  const { data } = await apiClient.post<Product>('/products', input)
  return data
}

async function updateProductRequest(id: string, updates: Partial<Product>): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/products/${id}`, updates)
  return data
}

async function deleteProductRequest(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`)
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
