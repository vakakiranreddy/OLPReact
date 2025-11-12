export interface User {
  userId: number
  firstName: string
  lastName: string
  email: string
  role: number
  departmentName?: string
  profileImage?: string
  profileImageUrl?: string
}

export interface UserResponse {
  id: number
  userId: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  address?: string
  role: number
  isEmailVerified: boolean
  isActive: boolean
  createdAt: string
  departmentName?: string
  profileImage?: string
  profileImageUrl?: string
}

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
  phoneNumber: string
  address?: string
}

export interface UpdateUserRoleRequest {
  userId: number
  role: number
}