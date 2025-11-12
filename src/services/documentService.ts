import api from './api'
import type { ApiResponse, DocumentResponse, CertificateWithData } from '../types'

export const documentService = {
  // Upload single document
  uploadDocument: async (applicationId: number, requiredDocumentId: number, file: File): Promise<DocumentResponse> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('applicationId', applicationId.toString())
      formData.append('requiredDocumentId', requiredDocumentId.toString())
      
      const response = await api.post<ApiResponse<DocumentResponse>>('/ApplicationDocument/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data.data
    } catch (error) {
      console.error('Error uploading document:', error)
      throw new Error('Failed to upload document')
    }
  },

  // Upload multiple documents
  uploadMultipleDocuments: async (applicationId: number, documents: { requiredDocumentId: number, file: File }[]): Promise<DocumentResponse[]> => {
    try {
      const formData = new FormData()
      formData.append('applicationId', applicationId.toString())
      
      documents.forEach((doc, index) => {
        formData.append(`files`, doc.file)
        formData.append(`requiredDocumentIds[${index}]`, doc.requiredDocumentId.toString())
      })
      
      const response = await api.post<ApiResponse<DocumentResponse[]>>('/ApplicationDocument/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data.data
    } catch (error) {
      console.error('Error uploading multiple documents:', error)
      throw new Error('Failed to upload documents')
    }
  },

  // Get application documents
  getApplicationDocuments: async (applicationId: number): Promise<DocumentResponse[]> => {
    try {
      const response = await api.get<ApiResponse<DocumentResponse[]>>(`/ApplicationDocument/application/${applicationId}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching application documents:', error)
      throw new Error('Failed to fetch documents')
    }
  },

  // Get application documents with required document IDs for form pre-filling
  getApplicationDocumentsWithRequiredId: async (applicationId: number): Promise<DocumentResponse[]> => {
    try {
      const response = await api.get<ApiResponse<DocumentResponse[]>>(`/ApplicationDocument/application/${applicationId}/with-required-id`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching application documents with required ID:', error)
      throw new Error('Failed to fetch documents')
    }
  },

  // Download document
  downloadDocument: async (documentId: number): Promise<Blob> => {
    try {
      const response = await api.get(`/ApplicationDocument/download/${documentId}`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error downloading document:', error)
      throw new Error('Failed to download document')
    }
  },

  // Delete document
  deleteDocument: async (documentId: number): Promise<void> => {
    try {
      await api.delete(`/ApplicationDocument/${documentId}`)
    } catch (error) {
      console.error('Error deleting document:', error)
      throw new Error('Failed to delete document')
    }
  },

  // Get application certificates
  getApplicationCertificates: async (applicationId: number): Promise<DocumentResponse[]> => {
    try {
      const response = await api.get<ApiResponse<DocumentResponse[]>>(`/ApplicationDocument/certificates/${applicationId}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching application certificates:', error)
      throw new Error('Failed to fetch certificates')
    }
  },

  // Get application certificates with base64 data for display
  getApplicationCertificatesWithData: async (applicationId: number): Promise<CertificateWithData[]> => {
    try {
      const response = await api.get<ApiResponse<CertificateWithData[]>>(`/ApplicationDocument/certificates-with-data/${applicationId}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching application certificates with data:', error)
      throw new Error('Failed to fetch certificates with data')
    }
  }
}