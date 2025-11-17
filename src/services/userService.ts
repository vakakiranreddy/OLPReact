import api from './api'
import type { ApiResponse, UserResponse } from '../types'

export interface UpdateUserDto {
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
}

export interface AdminRegisterReviewerDto {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  role: number
  departmentId?: number
}

export const userService = {
  // Get current user profile
  getProfile: async (): Promise<UserResponse> => {
    try {
      const response = await api.get<ApiResponse<UserResponse>>('/user/profile')
      return response.data.data
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw new Error('Failed to fetch profile')
    }
  },

  // Update current user profile
  updateProfile: async (updateDto: UpdateUserDto): Promise<UserResponse> => {
    try {
      const response = await api.put<ApiResponse<UserResponse>>('/user/profile', updateDto)
      return response.data.data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw new Error('Failed to update profile')
    }
  },

  // Upload profile image
  uploadProfileImage: async (profileImage: File): Promise<{ profileImageUrl: string }> => {
    try {
      const formData = new FormData()
      formData.append('profileImage', profileImage)
      
      const response = await api.post<ApiResponse<{ profileImageUrl: string }>>('/user/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data.data
    } catch (error) {
      console.error('Error uploading profile image:', error)
      throw new Error('Failed to upload profile image')
    }
  },

  // Get user by ID
  getUserById: async (id: number): Promise<UserResponse> => {
    try {
      const response = await api.get<ApiResponse<UserResponse>>(`/user/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching user by ID:', error)
      throw new Error('Failed to fetch user')
    }
  },

  // Admin create user
  adminCreateUser: async (createDto: AdminRegisterReviewerDto): Promise<UserResponse> => {
    try {
      const response = await api.post<ApiResponse<UserResponse>>('/user/admin/create', createDto)
      return response.data.data
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Failed to create user')
    }
  },

  // Deactivate user
  deactivateUser: async (id: number): Promise<UserResponse> => {
    try {
      const response = await api.put<ApiResponse<UserResponse>>(`/user/${id}/deactivate`)
      return response.data.data
    } catch (error) {
      console.error('Error deactivating user:', error)
      throw new Error('Failed to deactivate user')
    }
  },

  // Activate user
  activateUser: async (id: number): Promise<UserResponse> => {
    try {
      const response = await api.put<ApiResponse<UserResponse>>(`/user/${id}/activate`)
      return response.data.data
    } catch (error) {
      console.error('Error activating user:', error)
      throw new Error('Failed to activate user')
    }
  },

  // Search users by name
  searchUsersByName: async (name: string): Promise<UserResponse[]> => {
    try {
      const response = await api.get<ApiResponse<UserResponse[]>>(`/user/search/${encodeURIComponent(name)}`)
      return response.data.data
    } catch (error) {
      console.error('Error searching users by name:', error)
      throw new Error('Failed to search users by name')
    }
  },

  // Get total users count
  getTotalUsersCount: async (): Promise<number> => {
    try {
      const response = await api.get('/user/statistics/total-count')
      return response.data.data
    } catch (error) {
      console.error('Error fetching total users count:', error)
      throw new Error('Failed to fetch total users count')
    }
  },

  // Get user counts by all departments
  getUserCountsByDepartment: async (): Promise<{ [key: string]: number }> => {
    try {
      const response = await api.get('/user/statistics/counts-by-department')
      return response.data.data
    } catch (error) {
      console.error('Error fetching user counts by department:', error)
      throw new Error('Failed to fetch user counts by department')
    }
  },
  // Get all users (Admin/DepartmentHead only)
  getAllUsers: async (): Promise<UserResponse[]> => {
    try {
      const response = await api.get<ApiResponse<UserResponse[]>>('/user/all')
      return response.data.data
    } catch (error) {
      console.error('Error fetching all users:', error)
      throw new Error('Failed to fetch all users')
    }
  },

  // Get users by role (Admin/DepartmentHead only)
  getUsersByRole: async (role: number): Promise<UserResponse[]> => {
    try {
      const response = await api.get<ApiResponse<UserResponse[]>>(`/user/by-role/${role}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching users by role:', error)
      throw new Error('Failed to fetch users by role')
    }
  },

  // Get users by department (Admin/DepartmentHead only)
  getUsersByDepartment: async (departmentId: number): Promise<UserResponse[]> => {
    try {
      const response = await api.get<ApiResponse<UserResponse[]>>(`/user/by-department/${departmentId}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching users by department:', error)
      throw new Error('Failed to fetch users by department')
    }
  },

  // Get users with filters (Admin/DepartmentHead only)
  getUsersWithFilters: async (role?: number, departmentId?: number, searchTerm?: string): Promise<UserResponse[]> => {
    try {
      const params = new URLSearchParams()
      if (role !== undefined) params.append('role', role.toString())
      if (departmentId !== undefined) params.append('departmentId', departmentId.toString())
      if (searchTerm) params.append('searchTerm', searchTerm)
      
      const response = await api.get<ApiResponse<UserResponse[]>>(`/user/filter?${params.toString()}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching filtered users:', error)
      throw new Error('Failed to fetch filtered users')
    }
  },

  // Get user count by role (Admin/DepartmentHead only)
  getUserCountByRole: async (role: number): Promise<number> => {
    try {
      const response = await api.get(`/user/statistics/count-by-role/${role}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching user count by role:', error)
      throw new Error('Failed to fetch user count by role')
    }
  },

  // Get user count by department (Admin/DepartmentHead only)
  getUserCountByDepartment: async (departmentId: number): Promise<number> => {
    try {
      const response = await api.get(`/user/statistics/count-by-department/${departmentId}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching user count by department:', error)
      throw new Error('Failed to fetch user count by department')
    }
  },

  // Get user counts by role (Admin/DepartmentHead only)
  getUserCountsByRole: async (): Promise<{ [key: string]: number }> => {
    try {
      const response = await api.get('/user/statistics/counts-by-role')
      return response.data.data
    } catch (error) {
      console.error('Error fetching user counts by role:', error)
      throw new Error('Failed to fetch user counts by role')
    }
  },

  // Get users with departments in one API call
  getUsersWithDepartments: async (): Promise<{ users: UserResponse[], departments: any[] }> => {
    try {
      const response = await api.get('/user/with-departments')
      return response.data.data
    } catch (error) {
      console.error('Error fetching users with departments:', error)
      throw new Error('Failed to fetch user management data')
    }
  }
}