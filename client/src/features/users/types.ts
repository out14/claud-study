export interface AppUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
  status: 'active' | 'inactive'
  joinedAt: string
  avatarUrl?: string
}
