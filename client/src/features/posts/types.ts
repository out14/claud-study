export type PostCategory = 'news' | 'chat' | 'promo'

export interface Post {
  id: string
  category: PostCategory
  title: string
  content: string
  author: string
  createdAt: string
}
