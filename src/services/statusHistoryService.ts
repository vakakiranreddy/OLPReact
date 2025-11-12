import api from './api'
import type { ApiResponse } from '../types'

export interface StatusHistoryItem {
  id: number
  applicationId: number
  status: number
  statusName: string
  changedBy: string
  changedDate: string
  remarks?: string
  note?: string
}

export interface AddStatusNoteRequest {
  note: string
}

export const statusHistoryService = {
  // Get application status history
  getApplicationStatusHistory: async (applicationId: number): Promise<StatusHistoryItem[]> => {
    try {
      const response = await api.get<ApiResponse<StatusHistoryItem[]>>(`/application-status-history/${applicationId}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching status history:', error)
      throw new Error('Failed to fetch status history')
    }
  },

  // Get latest status
  getLatestStatus: async (applicationId: number): Promise<StatusHistoryItem> => {
    try {
      const response = await api.get<ApiResponse<StatusHistoryItem>>(`/application-status-history/${applicationId}/latest`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching latest status:', error)
      throw new Error('Failed to fetch latest status')
    }
  },

  // Get user status history (Admin/DepartmentHead only)
  getUserStatusHistory: async (userId: number): Promise<StatusHistoryItem[]> => {
    try {
      const response = await api.get<ApiResponse<StatusHistoryItem[]>>(`/application-status-history/user/${userId}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching user status history:', error)
      throw new Error('Failed to fetch user status history')
    }
  },

  // Get my status history
  getMyStatusHistory: async (): Promise<StatusHistoryItem[]> => {
    try {
      const response = await api.get<ApiResponse<StatusHistoryItem[]>>('/application-status-history/my-history')
      return response.data.data
    } catch (error) {
      console.error('Error fetching my status history:', error)
      throw new Error('Failed to fetch my status history')
    }
  },

  // Get history by status
  getHistoryByStatus: async (status: number): Promise<StatusHistoryItem[]> => {
    try {
      const response = await api.get<ApiResponse<StatusHistoryItem[]>>(`/application-status-history/status/${status}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching history by status:', error)
      throw new Error('Failed to fetch history by status')
    }
  },

  // Get history by date range
  getHistoryByDateRange: async (fromDate: string, toDate: string): Promise<StatusHistoryItem[]> => {
    try {
      const response = await api.get<ApiResponse<StatusHistoryItem[]>>(`/application-status-history/date-range?fromDate=${fromDate}&toDate=${toDate}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching history by date range:', error)
      throw new Error('Failed to fetch history by date range')
    }
  },

  // Add status note
  addStatusNote: async (applicationId: number, note: string): Promise<void> => {
    try {
      await api.post(`/application-status-history/${applicationId}/add-note`, { note })
    } catch (error) {
      console.error('Error adding status note:', error)
      throw new Error('Failed to add status note')
    }
  }
}