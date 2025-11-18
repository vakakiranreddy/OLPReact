import api from './api'
import type { 
  LicenseType, 
  LicenseTypeDetails, 
  CreateLicenseType, 
  UpdateLicenseType, 
  Department,
  ApiResponse 
} from '../types'

export const licenseTypeService = {
  // Get all license types
  getAll: async (): Promise<LicenseType[]> => {
    try {
      const response = await api.get<ApiResponse<LicenseType[]>>('/licensetype')
      return response.data.data
    } catch (error) {
      console.error('Error fetching license types:', error)
      throw new Error('Failed to fetch license types')
    }
  },

  // Get license type by ID
  getById: async (id: number): Promise<LicenseTypeDetails> => {
    try {
      const response = await api.get<ApiResponse<LicenseTypeDetails>>(`/licensetype/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching license type:', error)
      throw new Error('Failed to fetch license type')
    }
  },

  // Get license types by department
  getByDepartment: async (departmentId: number): Promise<LicenseType[]> => {
    try {
      const response = await api.get<ApiResponse<LicenseType[]>>(`/licensetype/department/${departmentId}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching license types by department:', error)
      throw new Error('Failed to fetch license types by department')
    }
  },

  // Get active license types only
  getActive: async (): Promise<LicenseType[]> => {
    try {
      const response = await api.get<ApiResponse<LicenseType[]>>('/licensetype/active')
      return response.data.data
    } catch (error) {
      console.error('Error fetching active license types:', error)
      throw new Error('Failed to fetch active license types')
    }
  },

  // Create license type
  create: async (data: CreateLicenseType): Promise<LicenseType> => {
    try {
      const response = await api.post<ApiResponse<LicenseType>>('/licensetype', data)
      return response.data.data
    } catch (error) {
      console.error('Error creating license type:', error)
      throw new Error('Failed to create license type')
    }
  },

  // Update license type
  update: async (data: UpdateLicenseType): Promise<LicenseType> => {
    try {
      console.log('Sending update data:', data)
      const response = await api.put<ApiResponse<LicenseType>>('/licensetype', data)
      return response.data.data
    } catch (error: unknown) {
      console.error('Error updating license type:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown } }
        console.error('Error details:', axiosError.response?.data)
      }
      throw new Error('Failed to update license type')
    }
  },

  // Delete license type
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/licensetype/${id}`)
    } catch (error) {
      console.error('Error deleting license type:', error)
      throw new Error('Failed to delete license type')
    }
  },

  // Get license type count by department
  getCountByDepartment: async (departmentId: number): Promise<number> => {
    try {
      const response = await api.get<ApiResponse<number>>(`/licensetype/statistics/count-by-department/${departmentId}`)
      return response.data.data
    } catch (error) {
      console.error('Error getting license type count:', error)
      throw new Error('Failed to get license type count')
    }
  },

  // Upload license type image
  uploadImage: async (licenseTypeId: number, imageFile: File): Promise<void> => {
    try {
      const formData = new FormData()
      formData.append('LicenseTypeId', licenseTypeId.toString())
      formData.append('Image', imageFile)
      
      await api.post('/licensetype/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } catch (error) {
      console.error('Error uploading license type image:', error)
      throw new Error('Failed to upload license type image')
    }
  },

  // Combined API methods following established pattern
  // Create license type and get updated list
  createAndGetList: async (data: CreateLicenseType): Promise<{ createdLicenseType: LicenseType; allLicenseTypes: LicenseType[] }> => {
    try {
      const response = await api.post('/licensetype/create-with-updated-list', data)
      return response.data.data
    } catch (error) {
      console.error('Error creating license type:', error)
      throw new Error('Failed to create license type')
    }
  },

  // Update license type and get updated list
  updateAndGetList: async (data: UpdateLicenseType): Promise<{ updatedLicenseType: LicenseType; allLicenseTypes: LicenseType[] }> => {
    try {
      const response = await api.put('/licensetype/update-with-list', data)
      return response.data.data
    } catch (error) {
      console.error('Error updating license type:', error)
      throw new Error('Failed to update license type')
    }
  },

  // Delete license type and get updated list
  deleteAndGetList: async (id: number): Promise<LicenseType[]> => {
    try {
      const response = await api.delete(`/licensetype/${id}/delete-with-updated-list`)
      return response.data.data
    } catch (error) {
      console.error('Error deleting license type:', error)
      throw new Error('Failed to delete license type')
    }
  },

  // Get license types with departments for admin management
  getLicenseTypesWithDepartments: async (): Promise<{ licenseTypes: LicenseType[]; departments: Department[] }> => {
    try {
      const response = await api.get('/licensetype/with-departments')
      return response.data.data
    } catch (error) {
      console.error('Error fetching license types with departments:', error)
      throw new Error('Failed to fetch license type management data')
    }
  }
}