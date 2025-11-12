import React, { Suspense } from 'react'
import { Container, Navbar, Nav, Button } from 'react-bootstrap'
import { Routes, Route, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from './store'
import { logout } from './store/slices/authSlice'
import ProtectedRoute from './components/ProtectedRoute'
import { ROLES, UserRole } from './types/enums'

// Lazy load all page components
const Home = React.lazy(() => import('./pages/Home'))
const Login = React.lazy(() => import('./pages/Login'))
const Register = React.lazy(() => import('./pages/Register'))
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'))
const Unauthorized = React.lazy(() => import('./pages/Unauthorized'))
const Departments = React.lazy(() => import('./pages/Departments'))
const DepartmentLicenses = React.lazy(() => import('./pages/DepartmentLicenses'))
const ApplyLicense = React.lazy(() => import('./pages/ApplyLicense'))
const MyApplications = React.lazy(() => import('./pages/MyApplications'))
const MyLicenseCertifications = React.lazy(() => import('./pages/MyLicenseCertifications'))
const ApplicationProcess = React.lazy(() => import('./pages/ApplicationProcess'))

const ApplicationDetails = React.lazy(() => import('./pages/ApplicationDetails'))
const DocumentUpload = React.lazy(() => import('./pages/DocumentUpload'))
const PaymentPage = React.lazy(() => import('./pages/PaymentPage'))
const ReviewerDashboard = React.lazy(() => import('./pages/ReviewerDashboard'))
const DepartmentHeadDashboard = React.lazy(() => import('./pages/DepartmentHeadDashboard'))
const AdminUserManagement = React.lazy(() => import('./pages/AdminUserManagement'))
const AdminRequiredDocuments = React.lazy(() => import('./pages/AdminRequiredDocuments'))
const AdminNotifications = React.lazy(() => import('./pages/AdminNotifications'))
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'))
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'))

function App() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <>
      {/* Navigation Bar */}
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Online License Permit System
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              {isAuthenticated && (
                <>
                  {(user?.role === UserRole.Applicant) && (
                    <>
                      <Nav.Link as={Link} to="/departments">Departments</Nav.Link>
                      <Nav.Link as={Link} to="/my-applications">My Applications</Nav.Link>
                      <Nav.Link as={Link} to="/my-license-certifications">My License Certifications</Nav.Link>
                    </>
                  )}
                  {(user?.role === UserRole.Reviewer) && (
                    <>
                      <Nav.Link as={Link} to="/reviewer/verified">Verified</Nav.Link>
                      <Nav.Link as={Link} to="/reviewer/under-review">Under Review</Nav.Link>
                      <Nav.Link as={Link} to="/reviewer/rejected">Rejected</Nav.Link>
                      <Nav.Link as={Link} to="/reviewer/statistics">My Statistics</Nav.Link>
                    </>
                  )}
                  {(user?.role === UserRole.DepartmentHead) && (
                    <>
                      <Nav.Link as={Link} to="/department-head/need-approval">Need Approval</Nav.Link>
                      <Nav.Link as={Link} to="/department-head/approved">Approved</Nav.Link>
                      <Nav.Link as={Link} to="/department-head/rejected">Rejected</Nav.Link>
                      <Nav.Link as={Link} to="/department-head/statistics">Statistics</Nav.Link>
                      <Nav.Link as={Link} to="/department-head/reviewers">Reviewers</Nav.Link>
                    </>
                  )}
                  {(user?.role === UserRole.Admin) && (
                    <>
                      <Nav.Link as={Link} to="/departments">Departments</Nav.Link>
                      <Nav.Link as={Link} to="/admin/documents">Required Documents</Nav.Link>
                      <Nav.Link as={Link} to="/admin/users">User Management</Nav.Link>
                      <Nav.Link as={Link} to="/admin/notifications">Send Notifications</Nav.Link>
                    </>
                  )}
                </>
              )}
            </Nav>
            <Nav>
              {isAuthenticated ? (
                <>
                  <Nav.Link as={Link} to="/notifications" className="me-2 position-relative">
                    <i className="bi bi-bell" style={{ fontSize: '1.2rem' }}></i>
                  </Nav.Link>
                  <Nav.Link as={Link} to="/profile" className="me-2">
                    {user?.profileImage ? (
                      <img
                        src={`data:image/jpeg;base64,${user.profileImage}`}
                        alt="Profile"
                        className="rounded-circle"
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-light text-dark d-flex align-items-center justify-content-center"
                        style={{ width: '32px', height: '32px', fontSize: '14px', fontWeight: 'bold' }}
                      >
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </div>
                    )}
                  </Nav.Link>
                  <Button variant="outline-light" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/register">Register</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Routes */}
      <Suspense fallback={<div className="d-flex justify-content-center align-items-center" style={{height: '50vh'}}><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        <Route path="/departments" element={
          <ProtectedRoute requiredRoles={ROLES.ALL_ROLES}>
            <Departments />
          </ProtectedRoute>
        } />
        
        <Route path="/departments/:departmentId/licenses" element={
          <ProtectedRoute requiredRoles={ROLES.ALL_ROLES}>
            <DepartmentLicenses />
          </ProtectedRoute>
        } />
        
        <Route path="/apply-license" element={
          <ProtectedRoute requiredRoles={ROLES.ALL_ROLES}>
            <ApplyLicense />
          </ProtectedRoute>
        } />
        
        <Route path="/my-applications" element={
          <ProtectedRoute requiredRoles={ROLES.ALL_ROLES}>
            <MyApplications />
          </ProtectedRoute>
        } />
        
        <Route path="/my-license-certifications" element={
          <ProtectedRoute requiredRoles={ROLES.ALL_ROLES}>
            <MyLicenseCertifications />
          </ProtectedRoute>
        } />
        
        <Route path="/application-process/:applicationId" element={
          <ProtectedRoute requiredRoles={ROLES.ALL_ROLES}>
            <ApplicationProcess />
          </ProtectedRoute>
        } />
        
        <Route path="/draft-application/:applicationId" element={
          <ProtectedRoute requiredRoles={ROLES.ALL_ROLES}>
            <ApplicationProcess />
          </ProtectedRoute>
        } />
        
        <Route path="/application-details/:applicationId" element={
          <ProtectedRoute requiredRoles={ROLES.ALL_ROLES}>
            <ApplicationDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/documents/:applicationId" element={
          <ProtectedRoute requiredRoles={ROLES.ALL_ROLES}>
            <DocumentUpload />
          </ProtectedRoute>
        } />
        
        <Route path="/payment/:applicationId" element={
          <ProtectedRoute requiredRoles={ROLES.ALL_ROLES}>
            <PaymentPage />
          </ProtectedRoute>
        } />
        
        <Route path="/reviewer" element={
          <ProtectedRoute requiredRoles={ROLES.REVIEWER}>
            <ReviewerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/reviewer/verified" element={
          <ProtectedRoute requiredRoles={ROLES.REVIEWER}>
            <ReviewerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/reviewer/under-review" element={
          <ProtectedRoute requiredRoles={ROLES.REVIEWER}>
            <ReviewerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/reviewer/rejected" element={
          <ProtectedRoute requiredRoles={ROLES.REVIEWER}>
            <ReviewerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/reviewer/statistics" element={
          <ProtectedRoute requiredRoles={ROLES.REVIEWER}>
            <ReviewerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/department-head" element={
          <ProtectedRoute requiredRoles={ROLES.DEPARTMENT_HEAD}>
            <DepartmentHeadDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/department-head/need-approval" element={
          <ProtectedRoute requiredRoles={ROLES.DEPARTMENT_HEAD}>
            <DepartmentHeadDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/department-head/approved" element={
          <ProtectedRoute requiredRoles={ROLES.DEPARTMENT_HEAD}>
            <DepartmentHeadDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/department-head/rejected" element={
          <ProtectedRoute requiredRoles={ROLES.DEPARTMENT_HEAD}>
            <DepartmentHeadDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/department-head/statistics" element={
          <ProtectedRoute requiredRoles={ROLES.DEPARTMENT_HEAD}>
            <DepartmentHeadDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/department-head/reviewers" element={
          <ProtectedRoute requiredRoles={ROLES.DEPARTMENT_HEAD}>
            <DepartmentHeadDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute requiredRoles={ROLES.ADMIN}>
            <AdminUserManagement />
          </ProtectedRoute>
        } />
        

        <Route path="/admin/documents" element={
          <ProtectedRoute requiredRoles={ROLES.ADMIN}>
            <AdminRequiredDocuments />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRoles={ROLES.ADMIN}>
            <AdminUserManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/notifications" element={
          <ProtectedRoute requiredRoles={ROLES.ADMIN}>
            <AdminNotifications />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute requiredRoles={ROLES.ALL_ROLES}>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/notifications" element={
          <ProtectedRoute requiredRoles={ROLES.ALL_ROLES}>
            <NotificationsPage />
          </ProtectedRoute>
        } />
        

        
       
        

        </Routes>
      </Suspense>
    </>
  )
}

export default App