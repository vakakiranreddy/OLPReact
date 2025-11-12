import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: number[]
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute