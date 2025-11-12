import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { userService } from '../services/userService'
import { departmentService } from '../services/departmentService'
import { licenseTypeService } from '../services/licenseTypeService'
import { UserRole } from '../types/enums'

const Home: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalDepartments: 0,
    totalLicenseTypes: 0,
    totalReviewers: 0
  })

  useEffect(() => {
    if (isAuthenticated && user?.role === UserRole.Admin) {
      loadAdminStats()
    }
  }, [isAuthenticated, user])

  const loadAdminStats = async () => {
    try {
      const [usersData, deptData, licenseTypesData, userCounts] = await Promise.all([
        userService.getAllUsers(),
        departmentService.getAll(),
        licenseTypeService.getAll(),
        userService.getUserCountsByRole()
      ])
      
      setAdminStats({
        totalUsers: usersData.length,
        totalDepartments: deptData.length,
        totalLicenseTypes: licenseTypesData.length,
        totalReviewers: userCounts['Reviewer'] || userCounts['1'] || 0
      })
    } catch (error) {
      console.error('Error loading admin stats:', error)
    }
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Main Content */}
      <div className="flex-grow-1">
        <Container className="py-5">
          <Row className="align-items-center mb-5">
            <Col md={7} className="order-md-1 order-2 ps-5">
              <h1 className="display-5 fw-bold text-primary mb-3">Government License Portal</h1>
              <p className="fs-5 mb-3">
                Apply for government licenses and permits online with our secure digital platform.
              </p>
              
              <ul className="mb-3 list-unstyled fs-5">
                <li className="mb-1">✓ Online Applications</li>
                <li className="mb-1">✓ Real-time Tracking</li>
                <li className="mb-1">✓ Secure Payments</li>
                <li className="mb-1">✓ Digital Certificates</li>
              </ul>

              {!isAuthenticated && (
                <div>
                  <Link to="/register">
                    <Button variant="primary" className="me-3">
                      Get Started
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline-primary">
                      Login
                    </Button>
                  </Link>
                </div>
              )}
            </Col>
            
            <Col md={5} className="order-md-2 order-1 text-end mb-3 mb-md-0" style={{paddingRight: '3rem'}}>
              <img 
                src="/images/govtimg.png" 
                alt="Government Logo" 
                className="img-fluid"
                style={{ maxHeight: '250px', width: 'auto' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/250x250/007bff/ffffff?text=Government+Logo'
                }}
              />
            </Col>
          </Row>

          {/* Service Cards - Different for Admin vs Regular Users */}
          {isAuthenticated && user?.role === UserRole.Admin ? (
            <Row className="g-4 justify-content-center">
              <Col lg={3} md={6} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <i className="fas fa-building text-primary mb-3" style={{fontSize: '3rem'}}></i>
                    <Card.Title className="h5">Total Departments</Card.Title>
                    <h2 className="text-primary">{adminStats.totalDepartments}</h2>
                    <Link 
                      to="/departments" 
                      className="btn btn-primary w-100 text-decoration-none mt-2"
                    >
                      Manage Departments
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col lg={3} md={6} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <i className="fas fa-certificate text-success mb-3" style={{fontSize: '3rem'}}></i>
                    <Card.Title className="h5">License Types</Card.Title>
                    <h2 className="text-success">{adminStats.totalLicenseTypes}</h2>
                    <Link 
                      to="/admin/documents" 
                      className="btn btn-success w-100 text-decoration-none mt-2"
                    >
                      Manage Licenses
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col lg={3} md={6} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <i className="fas fa-users text-info mb-3" style={{fontSize: '3rem'}}></i>
                    <Card.Title className="h5">Total Users</Card.Title>
                    <h2 className="text-info">{adminStats.totalUsers}</h2>
                    <Link 
                      to="/admin/users" 
                      className="btn btn-info w-100 text-decoration-none mt-2"
                    >
                      Manage Users
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col lg={3} md={6} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <i className="fas fa-user-check text-warning mb-3" style={{fontSize: '3rem'}}></i>
                    <Card.Title className="h5">Active Reviewers</Card.Title>
                    <h2 className="text-warning">{adminStats.totalReviewers}</h2>
                    <Link 
                      to="/admin/users" 
                      className="btn btn-warning w-100 text-decoration-none mt-2"
                    >
                      View Reviewers
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ) : (
            <Row className="g-4 justify-content-center">
              <Col lg={3} md={6} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <i className="bi bi-building text-primary mb-3" style={{fontSize: '3rem'}}></i>
                    <Card.Title className="h5">Departments</Card.Title>
                    <Card.Text className="text-muted">
                      Browse government departments and their services
                    </Card.Text>
                    <Link 
                      to={isAuthenticated ? "/departments" : "/login"} 
                      className="btn btn-primary w-100 text-decoration-none"
                    >
                      View Departments
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col lg={3} md={6} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <i className="bi bi-file-earmark-text text-success mb-3" style={{fontSize: '3rem'}}></i>
                    <Card.Title className="h5">License Types</Card.Title>
                    <Card.Text className="text-muted">
                      Explore available license types and requirements
                    </Card.Text>
                    <Link 
                      to={isAuthenticated ? "/departments" : "/login"} 
                      className="btn btn-success w-100 text-decoration-none"
                    >
                      Browse Licenses
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col lg={3} md={6} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <i className="bi bi-award text-warning mb-3" style={{fontSize: '3rem'}}></i>
                    <Card.Title className="h5">Digital Certification</Card.Title>
                    <Card.Text className="text-muted">
                      Access your digital certificates and licenses
                    </Card.Text>
                    <Link 
                      to={isAuthenticated ? "/my-applications" : "/login"} 
                      className="btn btn-warning w-100 text-decoration-none"
                    >
                      My Certificates
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col lg={3} md={6} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <i className="bi bi-headset text-info mb-3" style={{fontSize: '3rem'}}></i>
                    <Card.Title className="h5">Customer Support</Card.Title>
                    <Card.Text className="text-muted">
                      Get help and support for your applications
                    </Card.Text>
                    <a href="tel:1-800-GOV-HELP" className="btn btn-info w-100 text-decoration-none">
                      Contact Support
                    </a>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Scrolling Instructions */}
          <div className="mt-4 py-2 bg-light rounded">
            <h5 className="text-center mb-3">How It Works</h5>
            <div className="overflow-hidden">
              <div className="d-flex animate-scroll">
                <div className="flex-shrink-0 text-center mx-3">
                  <i className="bi bi-1-circle-fill text-primary mb-1" style={{fontSize: '1.5rem'}}></i>
                  <h6>Select License</h6>
                </div>
                <div className="flex-shrink-0 text-center mx-3">
                  <i className="bi bi-2-circle-fill text-success mb-1" style={{fontSize: '1.5rem'}}></i>
                  <h6>Upload Documents</h6>
                </div>
                <div className="flex-shrink-0 text-center mx-3">
                  <i className="bi bi-3-circle-fill text-warning mb-1" style={{fontSize: '1.5rem'}}></i>
                  <h6>Make Payment</h6>
                </div>
                <div className="flex-shrink-0 text-center mx-3">
                  <i className="bi bi-4-circle-fill text-info mb-1" style={{fontSize: '1.5rem'}}></i>
                  <h6>Submit Application</h6>
                </div>
                {/* Repeat for continuous scroll */}
                <div className="flex-shrink-0 text-center mx-3">
                  <i className="bi bi-1-circle-fill text-primary mb-1" style={{fontSize: '1.5rem'}}></i>
                  <h6>Select License</h6>
                </div>
                <div className="flex-shrink-0 text-center mx-3">
                  <i className="bi bi-2-circle-fill text-success mb-1" style={{fontSize: '1.5rem'}}></i>
                  <h6>Upload Documents</h6>
                </div>
                <div className="flex-shrink-0 text-center mx-3">
                  <i className="bi bi-3-circle-fill text-warning mb-1" style={{fontSize: '1.5rem'}}></i>
                  <h6>Make Payment</h6>
                </div>
                <div className="flex-shrink-0 text-center mx-3">
                  <i className="bi bi-4-circle-fill text-info mb-1" style={{fontSize: '1.5rem'}}></i>
                  <h6>Submit Application</h6>
                </div>
                <div className="flex-shrink-0 text-center mx-3">
                  <i className="bi bi-1-circle-fill text-primary mb-1" style={{fontSize: '1.5rem'}}></i>
                  <h6>Select License</h6>
                </div>
                <div className="flex-shrink-0 text-center mx-3">
                  <i className="bi bi-2-circle-fill text-success mb-1" style={{fontSize: '1.5rem'}}></i>
                  <h6>Upload Documents</h6>
                </div>
                <div className="flex-shrink-0 text-center mx-3">
                  <i className="bi bi-3-circle-fill text-warning mb-1" style={{fontSize: '1.5rem'}}></i>
                  <h6>Make Payment</h6>
                </div>
                <div className="flex-shrink-0 text-center mx-3">
                  <i className="bi bi-4-circle-fill text-info mb-1" style={{fontSize: '1.5rem'}}></i>
                  <h6>Submit Application</h6>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-light py-2 mt-auto">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <small>&copy; 2024 Government License Portal</small>
            </Col>
            <Col md={6} className="text-md-end">
              <small>
                <Link to="/" className="text-light text-decoration-none me-3">Home</Link>
                <span className="me-3">Help: 1-800-GOV-HELP</span>
                <span>support@gov.portal</span>
              </small>
            </Col>
          </Row>
        </Container>
      </footer>

      <style>{`
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}

export default Home