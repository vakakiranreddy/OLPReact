export interface LicenseType {
  licenseTypeId: number
  licenseName: string
  description?: string
  processingFee: number
  departmentName: string
  departmentId: number
  isActive: boolean
  createdAt: string
  applicationCount?: number
  image?: string
}

export interface LicenseTypeDetails {
  licenseTypeId: number
  licenseName: string
  description?: string
  processingFee: number
  isActive: boolean
  createdAt: string
  departmentId: number
  departmentName: string
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
  requiredDocuments: string[]
  formattedFee: string
  image?: string
}

export interface CreateLicenseType {
  LicenseName: string
  Description?: string
  ProcessingFee: number
  DepartmentId: number
}

export interface UpdateLicenseType {
  LicenseTypeId: number
  LicenseName: string
  Description?: string
  ProcessingFee: number
  DepartmentId: number
  IsActive: boolean
}

export interface RequiredDocument {
  requiredDocumentId: number
  documentName: string
  description?: string
  isMandatory: boolean
  licenseTypeId?: number
  licenseTypeName?: string
}

export interface CreateRequiredDocument {
  documentName: string
  description?: string
  isMandatory: boolean
  licenseTypeId: number
}

export interface UpdateRequiredDocument {
  requiredDocumentId: number
  documentName: string
  description?: string
  isMandatory: boolean
}

export interface DocumentUpload {
  requiredDocumentId: number
  file: File
  documentName: string
  isMandatory: boolean
}

// Department interfaces
export interface Department {
  departmentId: number
  departmentName: string
  description?: string
  isActive?: boolean
  createdAt?: string
  userCount?: number
  licenseTypeCount?: number
  applicationCount?: number
  image?: string
}

export interface CreateDepartment {
  DepartmentName: string
  Description?: string
}

export interface UpdateDepartment {
  DepartmentId: number
  DepartmentName: string
  Description?: string
  IsActive: boolean
}