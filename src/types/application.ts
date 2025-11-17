export interface CreateApplicationRequest {
  LicenseTypeId: number
  ApplicantRemarks?: string
}

export interface VerifyApplicationRequest {
  ApplicationId: number
  VerificationRemarks?: string
}

export interface ApplicationListItem {
  applicationId: number
  applicationNumber: string
  licenseTypeName: string
  applicantName: string
  status: number
  appliedDate: string
  lastStatusChangeDate: string
  reviewerId?: number
  reviewerName?: string
}

export interface ApplicationDetails {
  applicationId: number
  applicationNumber: string
  status: number
  appliedDate: string
  applicantRemarks?: string
  rejectionReason?: string
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  licenseTypeId: number
  licenseTypeName: string
  departmentName: string
  reviewerId?: number
  reviewerName?: string
  departmentHeadName?: string
  verifiedDate?: string
  paymentDate?: string
  approvedDate?: string
  rejectedDate?: string
  paymentAmount?: number
  paymentStatus?: number
}

export interface ApproveApplicationRequest {
  ApplicationId: number
  ApprovalRemarks?: string
}

export interface RejectApplicationRequest {
  ApplicationId: number
  RejectionReason: string
}

export interface AssignReviewerRequest {
  ApplicationId: number
  ReviewerId: number
}

export interface ApplicationDocument {
  applicationDocumentId: number
  applicationId: number
  requiredDocumentId: number
  fileName: string
  fileSize: number
  fileType: string
  uploadedAt: string
}

export interface CompleteApplicationDetails {
  applicationDetails: {
    applicationId: number
    applicationNumber: string
    licenseTypeId: number
    licenseTypeName: string
    userId: number
    firstName: string
    lastName: string
    email: string
    status: string
    submittedAt: string
    reviewerId?: number
    reviewerName?: string
    departmentId: number
    departmentName: string
  }
  requiredDocuments: {
    requiredDocumentId: number
    licenseTypeId: number
    documentName: string
    description: string
    isRequired: boolean
  }[]
  applicationDocuments: ApplicationDocument[]
}