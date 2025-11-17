import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components'
import { MainLayout } from './layouts'
import { ROLES } from './common'

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
  return (
    <MainLayout>
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
        
        <Route path="/department-head/under-review" element={
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
        
        <Route path="/department-head/broadcast" element={
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
    </MainLayout>
  )
}

export default App