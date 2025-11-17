import api from './api'
import type { LoginRequest, RegisterRequest, LoginResponse, ApiResponse, AxiosErrorResponse } from '../types'

// Type guard for axios errors
const isAxiosError = (error: unknown): error is AxiosErrorResponse => {
  return error instanceof Error && 'response' in error
}

// Helper to extract error message
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message
  }
  return fallback
}

// Auth Service
export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials)
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.data.token)
      
      return response.data.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Login failed. Please try again.'))
    }
  },

  // Register user
  register: async (userData: RegisterRequest): Promise<void> => {
    try {
      const response = await api.post<ApiResponse<void>>('/auth/register', userData)
      return response.data.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Registration failed. Please try again.'))
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Send OTP for email verification
  sendOtp: async (email: string): Promise<void> => {
    try {
      const response = await api.post<ApiResponse<void> & { success?: boolean }>('/auth/send-verification-otp', { email })
      // Check if response indicates failure
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Email already exists')
      }
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Email already exists'))
    }
  },

  // Verify OTP
  verifyOtp: async (email: string, otp: string): Promise<void> => {
    try {
      await api.post<ApiResponse<boolean>>('/auth/verify-email', { email, otp })
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Invalid OTP. Please try again.'))
    }
  },

  // Send forgot password OTP
  sendForgotPasswordOtp: async (email: string): Promise<void> => {
    try {
      await api.post<ApiResponse<boolean>>('/auth/send-forgot-password-otp', { email })
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to send password reset OTP.'))
    }
  },

  // Reset password with OTP
  forgotPassword: async (email: string, otp: string, newPassword: string, confirmNewPassword: string): Promise<void> => {
    try {
      await api.post<ApiResponse<boolean>>('/auth/forgot-password', {
        email,
        otp,
        newPassword,
        confirmNewPassword
      })
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to reset password.'))
    }
  },

  // Verify email with OTP
  verifyEmail: async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await api.post<ApiResponse<boolean>>('/auth/verify-email', { email, otp })
      return response.data.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Email verification failed.'))
    }
  },

  // Change password (for authenticated users)
  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
    try {
      await api.post<ApiResponse<boolean>>('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      })
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to change password.'))
    }
  },

  // Test email functionality (admin only)
  testEmail: async (email: string, subject: string, body: string): Promise<void> => {
    try {
      await api.post<ApiResponse<void>>('/auth/test-email', {
        email,
        subject,
        body
      })
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to send test email.'))
    }
  },

  // Admin create user
  adminCreateUser: async (userData: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    password: string
    confirmPassword: string
    role: number
    departmentId?: number
    address?: string
  }): Promise<void> => {
    try {
      await api.post<ApiResponse<void>>('/auth/admin-create-user', userData)
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to create user.'))
    }
  },

  
  getToken: (): string | null => {
    return localStorage.getItem('token')
  },
}