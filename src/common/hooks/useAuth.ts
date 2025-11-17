import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { UserRole } from '../../types/enums'

export const useAuth = () => {
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth)

  const hasRole = (requiredRoles: number[]): boolean => {
    if (!user) return false
    return requiredRoles.includes(user.role)
  }

  const isAdmin = (): boolean => {
    return user?.role === UserRole.Admin
  }

  const isDepartmentHead = (): boolean => {
    return user?.role === UserRole.DepartmentHead
  }

  const isReviewer = (): boolean => {
    return user?.role === UserRole.Reviewer
  }

  const isApplicant = (): boolean => {
    return user?.role === UserRole.Applicant
  }

  return {
    isAuthenticated,
    user,
    loading,
    hasRole,
    isAdmin,
    isDepartmentHead,
    isReviewer,
    isApplicant
  }
}