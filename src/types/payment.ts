export interface CreatePaymentRequest {
  ApplicationId: number
  Amount: number
  TransactionId: string
  Remarks?: string
}

export interface PaymentResponse {
  paymentId: number
  applicationId: number
  amount: number
  paymentMethod: string
  status: number
  paymentDate: string
  transactionId?: string
}

export interface PaymentInfo {
  applicationId: number
  amount: number
  qrCodeData?: string
  paymentInstructions?: string
}

export interface PaymentDetails {
  paymentId: number
  applicationId: number
  amount: number
  transactionId?: string
  paymentDate: string
  status: number
  remarks?: string
}