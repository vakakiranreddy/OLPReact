// User roles constants matching your C# backend
export const UserRole = {
  Applicant: 0,
  Reviewer: 1,
  DepartmentHead: 2,
  Admin: 3
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]

// Application Status
export const ApplicationStatus = {
  Draft: 0,
  UploadDocuments: 1,
  Payment: 2,
  Submit: 3,
  Submitted: 4,
  Review: 5,
  Approved: 6,
  Rejected: 7
} as const

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus]

// Payment Status
export const PaymentStatus = {
  Pending: 0,
  Completed: 1,
  Failed: 2,
  Refunded: 3
} as const

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus]

// Notification Type
export const NotificationType = {
  ApplicationUpdate: 0,
  General: 1
} as const

export type NotificationType = typeof NotificationType[keyof typeof NotificationType]

// Role-based permissions
export const ROLES = {
  APPLICANT: [UserRole.Applicant],
  REVIEWER: [UserRole.Reviewer],
  DEPARTMENT_HEAD: [UserRole.DepartmentHead],
  ADMIN: [UserRole.Admin],
  STAFF_AND_ABOVE: [UserRole.Reviewer, UserRole.DepartmentHead, UserRole.Admin],
  ALL_ROLES: [UserRole.Applicant, UserRole.Reviewer, UserRole.DepartmentHead, UserRole.Admin]
}