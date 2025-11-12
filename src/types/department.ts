export interface DepartmentResponse {
  id: number
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  image?: string
}

export interface CreateDepartmentRequest {
  name: string
  description?: string
}

export interface UpdateDepartmentRequest {
  id: number
  name: string
  description?: string
  isActive: boolean
}

export interface DepartmentDropdown {
  id: number
  name: string
}