import { STATUS_TEXT, STATUS_COLORS } from '../constants/applicationConstants'
import type { ApplicationListItem } from '../../types'

export const getStatusText = (status: number): string => {
  return STATUS_TEXT[status] || 'Unknown'
}

export const getStatusColor = (status: number): string => {
  return STATUS_COLORS[status] || 'secondary'
}

export const filterApplicationsByStatus = (
  applications: ApplicationListItem[],
  filter: string
): ApplicationListItem[] => {
  switch (filter) {
    case 'pending':
      return applications.filter(app => app.status === 3) // Under Review
    case 'verified':
      return applications.filter(app => [4, 8].includes(app.status)) // Verified, Approved
    case 'rejected':
      return applications.filter(app => app.status === 5) // Rejected
    case 'needApproval':
      return applications.filter(app => app.status === 4) // Verified - Ready for Approval
    case 'approved':
      return applications.filter(app => app.status === 8) // Approved by Department Head
    case 'underReview':
      return applications.filter(app => app.status === 3) // Under Review
    default:
      return applications
  }
}

export const searchApplications = (
  applications: ApplicationListItem[],
  searchTerm: string
): ApplicationListItem[] => {
  if (!searchTerm) return applications
  
  return applications.filter(app => 
    app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.licenseTypeName.toLowerCase().includes(searchTerm.toLowerCase())
  )
}