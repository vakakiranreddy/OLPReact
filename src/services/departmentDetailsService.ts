import api from './api'
import type { Department, LicenseType, ApiResponse } from '../types'

export interface DepartmentWithLicenseTypes {
  department: Department
  licenseTypes: LicenseType[]
}

export const departmentDetailsService = {
  // Get department with its license types in one API call
  getDepartmentWithLicenseTypes: async (departmentId: number): Promise<DepartmentWithLicenseTypes> => {
    try {
      const response = await api.get<ApiResponse<DepartmentWithLicenseTypes>>(`/department/${departmentId}/with-license-types`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching department with license types:', error)
      throw new Error('Failed to fetch department details')
    }
  }
}