export interface CreateUserNotificationRequest {
  userId: number
  title: string
  message: string
  type: number
  sendEmail: boolean
}

export interface UserNotificationResponse {
  id: number
  userId: number
  title: string
  message: string
  type: number
  isRead: boolean
  createdAt: string
}

export interface CreateBroadcastRequest {
  title: string
  message: string
  targetRole?: number
  departmentId?: number
}

export interface BroadcastNotificationResponse {
  id: number
  title: string
  message: string
  targetRole?: number
  departmentId?: number
  createdBy: string
  createdAt: string
}