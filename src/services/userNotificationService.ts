import api from './api'
import type { ApiResponse } from '../types'
import type { BroadcastNotification } from './broadcastNotificationService'

export interface UserNotification {
  notificationId: number
  userId: number
  title: string
  message: string
  isRead: boolean
  createdAt: string
  applicationId?: number
}

export interface CreateUserNotificationDto {
  title: string
  message: string
  type: number
  userId: number
  applicationId?: number
  sendEmail?: boolean
}

export interface AllNotificationsResponse {
  userNotifications: UserNotification[]
  broadcastNotifications: BroadcastNotification[]
}

export const userNotificationService = {
  // Get my notifications
  getMyNotifications: async (): Promise<UserNotification[]> => {
    try {
      const response = await api.get<ApiResponse<UserNotification[]>>('/user-notifications/my-notifications')
      return response.data.data
    } catch (error) {
      console.error('Error fetching my notifications:', error)
      throw new Error('Failed to fetch my notifications')
    }
  },

  // Get user notifications (Admin/DepartmentHead only)
  getUserNotifications: async (userId: number): Promise<UserNotification[]> => {
    try {
      const response = await api.get<ApiResponse<UserNotification[]>>(`/user-notifications/user/${userId}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching user notifications:', error)
      throw new Error('Failed to fetch user notifications')
    }
  },

  // Search my notifications
  searchMyNotifications: async (title: string): Promise<UserNotification[]> => {
    try {
      const response = await api.get<ApiResponse<UserNotification[]>>(`/user-notifications/search?title=${encodeURIComponent(title)}`)
      return response.data.data
    } catch (error) {
      console.error('Error searching notifications:', error)
      throw new Error('Failed to search notifications')
    }
  },

  // Create notification (Admin/DepartmentHead/Reviewer only)
  createNotification: async (createDto: CreateUserNotificationDto): Promise<UserNotification> => {
    try {
      const response = await api.post<ApiResponse<UserNotification>>('/user-notifications', createDto)
      return response.data.data
    } catch (error) {
      console.error('Error creating notification:', error)
      throw new Error('Failed to create notification')
    }
  },

  // Delete notification
  deleteNotification: async (id: number): Promise<void> => {
    try {
      await api.delete(`/user-notifications/${id}`)
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw new Error('Failed to delete notification')
    }
  },

  // Mark notification as read
  markAsRead: async (id: number): Promise<void> => {
    try {
      await api.put(`/user-notifications/${id}/mark-read`)
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw new Error('Failed to mark notification as read')
    }
  },

  // Get all notifications (user + broadcast)
  getAllNotifications: async (): Promise<AllNotificationsResponse> => {
    try {
      const response = await api.get<ApiResponse<AllNotificationsResponse>>('/user-notifications/all-notifications')
      return response.data.data
    } catch (error) {
      console.error('Error fetching all notifications:', error)
      throw new Error('Failed to fetch all notifications')
    }
  }
}