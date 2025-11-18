import api from './api'
import type { 
  Department, 
  CreateDepartment, 
  UpdateDepartment, 
  ApiResponse 
} from '../types'

export const departmentService = {
  // Get all departments
  getAll: async (): Promise<Department[]> => {
    try {
      const response = await api.get<ApiResponse<Department[]>>('/department')
      return response.data.data
    } catch (error) {
      console.error('Error fetching departments:', error)
      throw new Error('Failed to fetch departments')
    }
  },

  // Get department by ID
  getById: async (id: number): Promise<Department> => {
    try {
      const response = await api.get<ApiResponse<Department>>(`/department/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching department:', error)
      throw new Error('Failed to fetch department')
    }
  },

  // Get active departments only
  getActive: async (): Promise<Department[]> => {
    try {
      const response = await api.get<ApiResponse<Department[]>>('/department/active')
      return response.data.data
    } catch (error) {
      console.error('Error fetching active departments:', error)
      throw new Error('Failed to fetch active departments')
    }
  },

  // Create department
  create: async (data: CreateDepartment): Promise<Department> => {
    try {
      const response = await api.post<ApiResponse<Department>>('/department', data)
      return response.data.data
    } catch (error) {
      console.error('Error creating department:', error)
      throw new Error('Failed to create department')
    }
  },

  // Update department
  update: async (data: UpdateDepartment): Promise<Department> => {
    try {
      const response = await api.put<ApiResponse<Department>>('/department', data)
      return response.data.data
    } catch (error) {
      console.error('Error updating department:', error)
      throw new Error('Failed to update department')
    }
  },

  // Delete department
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/department/${id}`)
    } catch (error) {
      console.error('Error deleting department:', error)
      throw new Error('Failed to delete department')
    }
  },

  // Search departments by name
  searchByName: async (name: string): Promise<Department[]> => {
    try {
      const response = await api.get<ApiResponse<Department[]>>(`/department/search/${encodeURIComponent(name)}`)
      return response.data.data
    } catch (error) {
      console.error('Error searching departments:', error)
      throw new Error('Failed to search departments')
    }
  },

  // Get total count
  getTotalCount: async (): Promise<number> => {
    try {
      const response = await api.get<ApiResponse<number>>('/department/statistics/total-count')
      return response.data.data
    } catch (error) {
      console.error('Error getting department count:', error)
      throw new Error('Failed to get department count')
    }
  },

  // Upload department image
  uploadImage: async (departmentId: number, imageFile: File): Promise<void> => {
    try {
      const formData = new FormData()
      formData.append('DepartmentId', departmentId.toString())
      formData.append('Image', imageFile)
      
      await api.post('/department/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    } catch (error) {
      console.error('Error uploading department image:', error)
      throw new Error('Failed to upload department image')
    }
  },

  // Create department and get updated list
  createAndGetList: async (data: CreateDepartment): Promise<{ createdDepartment: Department; allDepartments: Department[] }> => {
    try {
      const response = await api.post<ApiResponse<{ createdDepartment: Department; allDepartments: Department[] }>>('/department/create-with-updated-list', data)
      return response.data.data
    } catch (error) {
      console.error('Error creating department:', error)
      throw new Error('Failed to create department')
    }
  },

  // Update department and get updated list
  updateAndGetList: async (data: UpdateDepartment): Promise<{ updatedDepartment: Department; allDepartments: Department[] }> => {
    try {
      const response = await api.put<ApiResponse<{ updatedDepartment: Department; allDepartments: Department[] }>>('/department/update-with-list', data)
      return response.data.data
    } catch (error) {
      console.error('Error updating department:', error)
      throw new Error('Failed to update department')
    }
  },

  // Delete department and get updated list
  deleteAndGetList: async (id: number): Promise<Department[]> => {
    try {
      const response = await api.delete<ApiResponse<Department[]>>(`/department/${id}/delete-with-updated-list`)
      return response.data.data
    } catch (error) {
      console.error('Error deleting department:', error)
      throw new Error('Failed to delete department')
    }
  }
}