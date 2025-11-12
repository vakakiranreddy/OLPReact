import api from './api'
import type { 
  CreatePaymentRequest,
  PaymentResponse,
  PaymentInfo,
  ApiResponse 
} from '../types'

export const paymentService = {
  // Get payment by ID
  getById: async (paymentId: number): Promise<PaymentResponse> => {
    try {
      const response = await api.get<ApiResponse<PaymentResponse>>(`/Payment/${paymentId}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching payment:', error)
      throw new Error('Failed to fetch payment')
    }
  },

  // Get payment by application ID
  getByApplicationId: async (applicationId: number): Promise<PaymentResponse> => {
    try {
      const response = await api.get<ApiResponse<PaymentResponse>>(`/Payment/application/${applicationId}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching payment by application:', error)
      throw new Error('Failed to fetch payment')
    }
  },

  // Get payments by user ID
  getByUserId: async (userId: number): Promise<PaymentResponse[]> => {
    try {
      const response = await api.get<ApiResponse<PaymentResponse[]>>(`/Payment/user/${userId}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching user payments:', error)
      throw new Error('Failed to fetch user payments')
    }
  },

  // Get current user's payments
  getMyPayments: async (): Promise<PaymentResponse[]> => {
    try {
      const response = await api.get<ApiResponse<PaymentResponse[]>>('/Payment/my-payments')
      return response.data.data
    } catch (error) {
      console.error('Error fetching my payments:', error)
      throw new Error('Failed to fetch payments')
    }
  },

  // Get payment info for application
  getPaymentInfo: async (applicationId: number): Promise<PaymentInfo> => {
    try {
      const response = await api.get<PaymentInfo>(`/Payment/info/${applicationId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching payment info:', error)
      throw new Error('Failed to fetch payment info')
    }
  },

  // Create payment (triggers application submission)
  create: async (data: CreatePaymentRequest): Promise<PaymentResponse> => {
    try {
      const response = await api.post<ApiResponse<PaymentResponse>>('/Payment', data)
      return response.data.data
    } catch (error) {
      console.error('Error creating payment:', error)
      throw new Error('Failed to create payment')
    }
  },

  // Get pending payments (Admin/Reviewer only)
  getPendingPayments: async (): Promise<PaymentResponse[]> => {
    try {
      const response = await api.get<ApiResponse<PaymentResponse[]>>('/Payment/pending')
      return response.data.data
    } catch (error) {
      console.error('Error fetching pending payments:', error)
      throw new Error('Failed to fetch pending payments')
    }
  }
}