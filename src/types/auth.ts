export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
  address?: string
}

export interface LoginResponse {
  token: string
  userId: number
  firstName: string
  lastName: string
  email: string
  role: number
  departmentId?: number
  departmentName?: string
}

export interface SendOtpRequest {
  email: string
}

export interface VerifyOtpRequest {
  email: string
  otp: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPasswordRequest {
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
}