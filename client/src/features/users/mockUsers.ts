import type { AppUser } from './types'

export const INITIAL_USERS: AppUser[] = [
  { id: 'usr-00', name: '테스트 사용자', email: 'test@example.com', role: 'admin', status: 'active', joinedAt: '2024-01-01' },
  { id: 'usr-01', name: '김민준', email: 'minjun.kim@example.com', role: 'admin', status: 'active', joinedAt: '2023-02-14' },
  { id: 'usr-02', name: '이서연', email: 'seoyeon.lee@example.com', role: 'member', status: 'active', joinedAt: '2023-05-03' },
  { id: 'usr-03', name: '박도윤', email: 'doyoon.park@example.com', role: 'member', status: 'inactive', joinedAt: '2024-01-22' },
  { id: 'usr-04', name: '최지우', email: 'jiwoo.choi@example.com', role: 'member', status: 'active', joinedAt: '2024-06-11' },
  { id: 'usr-05', name: '정하은', email: 'haeun.jung@example.com', role: 'admin', status: 'active', joinedAt: '2022-11-30' },
]
