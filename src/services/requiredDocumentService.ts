import api from './api'
import type { RequiredDocument, CreateRequiredDocument, UpdateRequiredDocument, ApiResponse } from '../types'

export const requiredDocumentService = {
  // Get required documents by license type
  getByLicenseType: async (licenseTypeId: number): Promise<RequiredDocument[]> => {
    try {
      const response = await api.get<ApiResponse<RequiredDocument[]>>(`/RequiredDocument/license-type/${licenseTypeId}/documents`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching required documents:', error)
      throw new Error('Failed to fetch required documents')
    }
  },

  // Search required documents by name
  searchByName: async (documentName: string): Promise<RequiredDocument[]> => {
    try {
      const response = await api.get<ApiResponse<RequiredDocument[]>>(`/RequiredDocument/search/${encodeURIComponent(documentName)}`)
      return response.data.data
    } catch (error) {
      console.error('Error searching required documents:', error)
      throw new Error('Failed to search required documents')
    }
  },

  // Create required document
  create: async (data: CreateRequiredDocument): Promise<RequiredDocument> => {
    try {
      console.log('Sending create request with data:', data)
      const response = await api.post<ApiResponse<RequiredDocument>>('/RequiredDocument', data)
      return response.data.data
    } catch (error) {
      console.error('Error creating required document:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown; status?: number } }
        console.error('Error response:', axiosError.response?.data)
        console.error('Error status:', axiosError.response?.status)
      }
      throw new Error('Failed to create required document')
    }
  },

  // Update required document
  update: async (data: UpdateRequiredDocument): Promise<RequiredDocument> => {
    try {
      const response = await api.put<ApiResponse<RequiredDocument>>('/RequiredDocument', data)
      return response.data.data
    } catch (error) {
      console.error('Error updating required document:', error)
      throw new Error('Failed to update required document')
    }
  },

  // Delete required document
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/RequiredDocument/${id}`)
    } catch (error) {
      console.error('Error deleting required document:', error)
      throw new Error('Failed to delete required document')
    }
  },

  // Create document and get updated list in one call
  createAndGetList: async (data: CreateRequiredDocument): Promise<{ createdDocument: RequiredDocument; allDocuments: RequiredDocument[] }> => {
    try {
      console.log('Sending create-and-list request with data:', data)
      const response = await api.post<ApiResponse<{ createdDocument: RequiredDocument; allDocuments: RequiredDocument[] }>>('/RequiredDocument/create-and-list', data)
      return response.data.data
    } catch (error) {
      console.error('Error creating required document:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown; status?: number } }
        console.error('Error response:', axiosError.response?.data)
        console.error('Error status:', axiosError.response?.status)
      }
      throw new Error('Failed to create required document')
    }
  },

  // Delete document and get updated list in one call
  deleteAndGetList: async (id: number, licenseTypeId: number): Promise<RequiredDocument[]> => {
    try {
      const response = await api.delete<ApiResponse<RequiredDocument[]>>(`/RequiredDocument/${id}/license-type/${licenseTypeId}/delete-with-updated-list`)
      return response.data.data
    } catch (error) {
      console.error('Error deleting required document:', error)
      throw new Error('Failed to delete required document')
    }
  },

  // Update document and get updated list in one call
  updateAndGetList: async (data: UpdateRequiredDocument, licenseTypeId: number): Promise<{ updatedDocument: RequiredDocument; allDocuments: RequiredDocument[] }> => {
    try {
      const response = await api.put<ApiResponse<{ updatedDocument: RequiredDocument; allDocuments: RequiredDocument[] }>>(`/RequiredDocument/license-type/${licenseTypeId}/update-with-list`, data)
      return response.data.data
    } catch (error) {
      console.error('Error updating required document:', error)
      throw new Error('Failed to update required document')
    }
  }
}