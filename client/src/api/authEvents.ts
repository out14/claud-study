type Listener = () => void

const listeners = new Set<Listener>()

// apiClient가 refresh까지 실패했을 때(세션 만료) 구독자에게 알립니다.
export function onSessionExpired(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitSessionExpired(): void {
  listeners.forEach((listener) => listener())
}
