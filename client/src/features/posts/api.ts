import { apiFetch, mockDelay, USE_MOCK_API } from '@src/api/client'
import { INITIAL_POSTS } from './mockPosts'
import type { Post } from './types'

let mockPosts = INITIAL_POSTS.map((post) => ({ ...post }))

function createPostId(): string {
  return `post-${Date.now()}`
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

type PostInput = Omit<Post, 'id' | 'createdAt'>

async function getPostsMock(): Promise<Post[]> {
  await mockDelay()
  return mockPosts.map((post) => ({ ...post }))
}

async function createPostMock(input: PostInput): Promise<Post> {
  await mockDelay()
  const post: Post = { ...input, id: createPostId(), createdAt: today() }
  mockPosts = [...mockPosts, post]
  return post
}

async function updatePostMock(id: string, updates: Partial<Post>): Promise<Post> {
  await mockDelay()
  mockPosts = mockPosts.map((post) => (post.id === id ? { ...post, ...updates } : post))

  const updated = mockPosts.find((post) => post.id === id)
  if (!updated) throw new Error('게시물을 찾을 수 없습니다.')
  return updated
}

async function deletePostMock(id: string): Promise<void> {
  await mockDelay()
  mockPosts = mockPosts.filter((post) => post.id !== id)
}

function getPostsRequest(): Promise<Post[]> {
  return apiFetch<Post[]>('/posts')
}

function createPostRequest(input: PostInput): Promise<Post> {
  return apiFetch<Post>('/posts', { method: 'POST', json: input })
}

function updatePostRequest(id: string, updates: Partial<Post>): Promise<Post> {
  return apiFetch<Post>(`/posts/${id}`, { method: 'PATCH', json: updates })
}

function deletePostRequest(id: string): Promise<void> {
  return apiFetch<void>(`/posts/${id}`, { method: 'DELETE' })
}

export function getPosts(): Promise<Post[]> {
  return USE_MOCK_API ? getPostsMock() : getPostsRequest()
}

export function createPost(input: PostInput): Promise<Post> {
  return USE_MOCK_API ? createPostMock(input) : createPostRequest(input)
}

export function updatePost(id: string, updates: Partial<Post>): Promise<Post> {
  return USE_MOCK_API ? updatePostMock(id, updates) : updatePostRequest(id, updates)
}

export function deletePost(id: string): Promise<void> {
  return USE_MOCK_API ? deletePostMock(id) : deletePostRequest(id)
}
