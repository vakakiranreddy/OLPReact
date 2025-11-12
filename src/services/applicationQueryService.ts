import api from './api'
import type { 
  ApplicationListItem,
  ApplicationDetails,
  ApiResponse 
} from '../types'

export const applicationQueryService = {
  // Get user's applications
  getMyApplications: async (): Promise<ApplicationListItem[]> => {
    try {
      const response = await api.get<ApiResponse<ApplicationListItem[]>>('/application-queries/my-applications')
      return response.data.data
    } catch (error) {
      console.error('Error fetching my applications:', error)
      throw new Error('Failed to fetch applications')
    }
  },

  // Get application details by ID
  getApplicationDetails: async (id: number): Promise<ApplicationDetails> => {
    try {
      const response = await api.get<ApiResponse<ApplicationDetails>>(`/application-queries/${id}/details`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching application details:', error)
      throw new Error('Failed to fetch application details')
    }
  },

  // Get required documents for application
  getRequiredDocuments: async (applicationId: number): Promise<unknown[]> => {
    try {
      const response = await api.get<ApiResponse<unknown[]>>(`/application-queries/${applicationId}/required-documents`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching required documents:', error)
      throw new Error('Failed to fetch required documents')
    }
  },

  // Check if all documents are uploaded
  checkDocumentsComplete: async (applicationId: number): Promise<boolean> => {
    try {
      const response = await api.get(`/application-queries/${applicationId}/documents-complete`)
      return response.data.allDocumentsUploaded || false
    } catch (error) {
      console.error('Error checking documents:', error)
      return false
    }
  },

  // Get applications assigned to current reviewer
  getMyReviewedApplications: async (): Promise<ApplicationListItem[]> => {
    try {
      const response = await api.get<ApiResponse<ApplicationListItem[]>>('/application-queries/my-reviewed')
      return response.data.data
    } catch (error) {
      console.error('Error fetching reviewed applications:', error)
      throw new Error('Failed to fetch reviewed applications')
    }
  },

  // Get applications pending review by current reviewer
  getMyPendingReviews: async (): Promise<ApplicationListItem[]> => {
    try {
      const response = await api.get<ApiResponse<ApplicationListItem[]>>('/application-queries/my-pending-reviews')
      return response.data.data
    } catch (error) {
      console.error('Error fetching pending reviews:', error)
      throw new Error('Failed to fetch pending reviews')
    }
  },

  // Get all applications (Admin/DepartmentHead only)
  getAllApplications: async (): Promise<ApplicationListItem[]> => {
    try {
      const response = await api.get<ApiResponse<ApplicationListItem[]>>('/application-queries/all')
      return response.data.data
    } catch (error) {
      console.error('Error fetching all applications:', error)
      throw new Error('Failed to fetch all applications')
    }
  },

  // Get applications by status
  getApplicationsByStatus: async (status: number): Promise<ApplicationListItem[]> => {
    try {
      const response = await api.get<ApiResponse<ApplicationListItem[]>>(`/application-queries/by-status/${status}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching applications by status:', error)
      throw new Error('Failed to fetch applications by status')
    }
  },

  // Get applications by department
  getApplicationsByDepartment: async (departmentId: number): Promise<ApplicationListItem[]> => {
    try {
      const response = await api.get<ApiResponse<ApplicationListItem[]>>(`/application-queries/department/${departmentId}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching department applications:', error)
      throw new Error('Failed to fetch department applications')
    }
  },

  // Get approved applications by department
  getApprovedApplicationsByDepartment: async (departmentId: number): Promise<ApplicationListItem[]> => {
    try {
      const response = await api.get<ApiResponse<ApplicationListItem[]>>(`/application-queries/department/${departmentId}/approved`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching approved department applications:', error)
      throw new Error('Failed to fetch approved department applications')
    }
  },

  // Get approved applications by department head
  getApprovedApplicationsByDepartmentHead: async (departmentHeadId: number): Promise<ApplicationListItem[]> => {
    try {
      const response = await api.get<ApiResponse<ApplicationListItem[]>>(`/application-queries/department-head/${departmentHeadId}/approved`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching department head approved applications:', error)
      throw new Error('Failed to fetch department head approved applications')
    }
  },

  // Get application count by status
  getApplicationCountByStatus: async (status: number): Promise<{ status: number, count: number }> => {
    try {
      const response = await api.get(`/application-queries/statistics/status/${status}/count`)
      return response.data
    } catch (error) {
      console.error('Error fetching application count by status:', error)
      throw new Error('Failed to fetch application count by status')
    }
  },

  // Get department application count
  getDepartmentApplicationCount: async (departmentId: number): Promise<{ departmentId: number, count: number }> => {
    try {
      const response = await api.get(`/application-queries/statistics/department/${departmentId}/count`)
      return response.data
    } catch (error) {
      console.error('Error fetching department application count:', error)
      throw new Error('Failed to fetch department application count')
    }
  },

  // Get my statistics (Reviewer/DepartmentHead)
  getMyStatistics: async (): Promise<{ userId: number, applicationCount: number }> => {
    try {
      const response = await api.get('/application-queries/statistics/my-stats')
      return response.data
    } catch (error) {
      console.error('Error fetching my statistics:', error)
      throw new Error('Failed to fetch my statistics')
    }
  }
}