import React from 'react'
import { Container, Navbar, Nav, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { logout } from '../store/slices/authSlice'
import { UserRole } from '../common'

const NavigationBar: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <Navbar bg="primary" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img 
            src="/images/logo.png" 
            alt="Online License Permit System" 
            height="32"
            className="d-inline-block align-top"
          />
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
                    <Nav.Link as={Link} to="/reviewer">Applications</Nav.Link>
                  </>
                )}
                {(user?.role === UserRole.DepartmentHead) && (
                  <>
                    <Nav.Link as={Link} to="/department-head">Applications</Nav.Link>
                    <Nav.Link as={Link} to="/department-head/reviewers">Reviewers</Nav.Link>
                    <Nav.Link as={Link} to="/department-head/broadcast">Broadcast</Nav.Link>
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
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
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
  )
}

export default NavigationBar