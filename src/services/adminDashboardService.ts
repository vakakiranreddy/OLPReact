import api from './api'
import type { UserResponse, Department, LicenseType, ApiResponse } from '../types'

export interface AdminDashboardData {
  users: UserResponse[]
  departments: Department[]
  licenseTypes: LicenseType[]
  userCountsByRole: { [key: string]: number }
}

export const adminDashboardService = {
  // Get all admin dashboard data in one API call
  getDashboardData: async (): Promise<AdminDashboardData> => {
    try {
      const response = await api.get<ApiResponse<AdminDashboardData>>('/admin/dashboard')
      return response.data.data
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error)
      throw new Error('Failed to fetch dashboard data')
    }
  }
}