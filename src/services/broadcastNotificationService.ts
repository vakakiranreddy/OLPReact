import api from './api'
import type { ApiResponse } from '../types'

export interface BroadcastNotification {
  id: number
  title: string
  message: string
  createdBy: string
  createdDate: string
  isActive: boolean
}

export interface CreateBroadcastDto {
  title: string
  message: string
  targetRole?: number
  targetDepartmentId?: number
}

export const broadcastNotificationService = {
  // Get all broadcasts
  getAllBroadcasts: async (): Promise<BroadcastNotification[]> => {
    try {
      const response = await api.get<ApiResponse<BroadcastNotification[]>>('/broadcast-notifications')
      return response.data.data
    } catch (error) {
      console.error('Error fetching broadcasts:', error)
      throw new Error('Failed to fetch broadcasts')
    }
  },

  // Get my broadcasts
  getMyBroadcasts: async (): Promise<BroadcastNotification[]> => {
    try {
      const response = await api.get<ApiResponse<BroadcastNotification[]>>('/broadcast-notifications/my-broadcasts')
      return response.data.data
    } catch (error) {
      console.error('Error fetching my broadcasts:', error)
      throw new Error('Failed to fetch my broadcasts')
    }
  },

  // Search broadcasts
  searchBroadcasts: async (title: string): Promise<BroadcastNotification[]> => {
    try {
      const response = await api.get<ApiResponse<BroadcastNotification[]>>(`/broadcast-notifications/search?title=${encodeURIComponent(title)}`)
      return response.data.data
    } catch (error) {
      console.error('Error searching broadcasts:', error)
      throw new Error('Failed to search broadcasts')
    }
  },

  // Create broadcast (Admin/DepartmentHead only)
  createBroadcast: async (createDto: CreateBroadcastDto): Promise<BroadcastNotification> => {
    try {
      const response = await api.post<ApiResponse<BroadcastNotification>>('/broadcast-notifications', createDto)
      return response.data.data
    } catch (error) {
      console.error('Error creating broadcast:', error)
      throw new Error('Failed to create broadcast')
    }
  },

  // Delete broadcast (Admin/DepartmentHead only)
  deleteBroadcast: async (id: number): Promise<void> => {
    try {
      await api.delete(`/broadcast-notifications/${id}`)
    } catch (error) {
      console.error('Error deleting broadcast:', error)
      throw new Error('Failed to delete broadcast')
    }
  }
}