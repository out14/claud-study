export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthUser {
  email: string
}

export interface LoginResult {
  accessToken: string
  user: AuthUser
}
