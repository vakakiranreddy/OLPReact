// Export all types from files
export * from './auth'
export * from './user'
export * from './application'
export * from './payment'
export * from './notification'
export * from './department'
export * from './license'
export * from './document'
export * from './enums'

// Common API types
export interface ApiResponse<T> {
  message: string
  data: T
}

export interface ApiError {
  response?: {
    data?: {
      message?: string
    }
    status?: number
  }
  message?: string
}

export interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string
    }
    status?: number
  }
}