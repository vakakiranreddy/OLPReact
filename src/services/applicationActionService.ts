import api from './api'
import type { 
  CreateApplicationRequest,
  ApplicationDetails,
  VerifyApplicationRequest,
  ApproveApplicationRequest,
  RejectApplicationRequest,
  ApiResponse 
} from '../types'

export const applicationActionService = {
  // Create application (Draft status)
  create: async (data: CreateApplicationRequest): Promise<ApplicationDetails> => {
    try {
      const response = await api.post<ApiResponse<ApplicationDetails>>('/application-actions/create', data)
      return response.data.data
    } catch (error) {
      console.error('Error creating application:', error)
      throw new Error('Failed to create application')
    }
  },

  // Submit application (after payment)
  submit: async (applicationId: number): Promise<ApplicationDetails> => {
    try {
      const response = await api.post<ApiResponse<ApplicationDetails>>(`/application-actions/${applicationId}/submit`)
      return response.data.data
    } catch (error) {
      console.error('Error submitting application:', error)
      throw new Error('Failed to submit application')
    }
  },

  // Verify application (Reviewer/DepartmentHead only)
  verify: async (data: VerifyApplicationRequest): Promise<ApplicationDetails> => {
    try {
      const response = await api.post<ApiResponse<ApplicationDetails>>(`/application-actions/${data.ApplicationId}/verify`, data)
      return response.data.data
    } catch (error) {
      console.error('Error verifying application:', error)
      throw new Error('Failed to verify application')
    }
  },

  // Approve application (Reviewer/DepartmentHead only)
  approve: async (data: ApproveApplicationRequest): Promise<ApplicationDetails> => {
    try {
      const response = await api.post<ApiResponse<ApplicationDetails>>(`/application-actions/${data.ApplicationId}/approve`, data)
      return response.data.data
    } catch (error) {
      console.error('Error approving application:', error)
      throw new Error('Failed to approve application')
    }
  },

  // Reject application (Reviewer/DepartmentHead only)
  reject: async (data: RejectApplicationRequest): Promise<ApplicationDetails> => {
    try {
      const response = await api.post<ApiResponse<ApplicationDetails>>(`/application-actions/${data.ApplicationId}/reject`, data)
      return response.data.data
    } catch (error) {
      console.error('Error rejecting application:', error)
      throw new Error('Failed to reject application')
    }
  },

  // Download certificate (for approved applications)
  downloadCertificate: async (applicationId: number): Promise<Blob> => {
    try {
      const response = await api.get(`/application-actions/${applicationId}/download-certificate`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error downloading certificate:', error)
      throw new Error('Failed to download certificate')
    }
  },

  // Download application report
  downloadReport: async (applicationId: number): Promise<Blob> => {
    try {
      const response = await api.get(`/application-actions/${applicationId}/download-report`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error downloading report:', error)
      throw new Error('Failed to download report')
    }
  }
}