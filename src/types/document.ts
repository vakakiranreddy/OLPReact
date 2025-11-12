export interface DocumentResponse {
  documentId: number
  applicationId: number
  requiredDocumentId: number
  documentName: string
  fileName: string
  fileType: string
  fileSize: number
  fileSizeFormatted: string
  uploadedDate: string
  fileData?: string // Base64 encoded file data for viewing
}

export interface UploadDocumentRequest {
  ApplicationId: number
  RequiredDocumentId: number
  File: File
}

export interface DocumentDownloadResponse {
  fileName: string
  fileType: string
  fileData: Uint8Array
}

export interface CertificateWithData {
  documentId: number
  documentName: string
  fileName: string
  fileType: string
  fileSize: number
  uploadedDate: string
  base64Data?: string
  isImage: boolean
}