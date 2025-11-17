// User roles enum matching your C# backend
export const UserRole = {
  Applicant: 0,
  Reviewer: 1,
  DepartmentHead: 2,
  Admin: 3
} as const

// Role-based permissions
export const ROLES = {
  APPLICANT: [UserRole.Applicant],
  REVIEWER: [UserRole.Reviewer],
  DEPARTMENT_HEAD: [UserRole.DepartmentHead],
  ADMIN: [UserRole.Admin],
  STAFF_AND_ABOVE: [UserRole.Reviewer, UserRole.DepartmentHead, UserRole.Admin],
  ALL_ROLES: [UserRole.Applicant, UserRole.Reviewer, UserRole.DepartmentHead, UserRole.Admin]
}