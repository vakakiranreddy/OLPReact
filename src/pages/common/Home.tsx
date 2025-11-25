import React, { useState, useEffect, useCallback } from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../app/store'
import { adminDashboardService } from '../../services/adminDashboardService'
import { fetchReviewerApplications } from '../../app/store/thunks/applicationThunks'
import { UserRole } from '../../types/enums'

const Home: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const { applications } = useSelector((state: RootState) => state.applications)
  const dispatch = useDispatch<AppDispatch>()
  const [showSupportDetails, setShowSupportDetails] = useState(false)
  const [showReviewerSupportDetails, setShowReviewerSupportDetails] = useState(false)
  const [showStatsDetails, setShowStatsDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalDepartments: 0,
    totalLicenseTypes: 0,
    totalReviewers: 0
  })

  const loadAdminStats = useCallback(async () => {
    if (isLoading) return
    
    setIsLoading(true)
    try {
      const dashboardData = await adminDashboardService.getDashboardData()
      
      setAdminStats({
        totalUsers: dashboardData.users.length,
        totalDepartments: dashboardData.departments.length,
        totalLicenseTypes: dashboardData.licenseTypes.length,
        totalReviewers: dashboardData.userCountsByRole['Reviewer'] || dashboardData.userCountsByRole['1'] || 0
      })
    } catch (error) {
      console.error('Error loading admin stats:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && user?.role === UserRole.Admin) {
      loadAdminStats()
    } else if (isAuthenticated && user?.role === UserRole.Reviewer) {
      dispatch(fetchReviewerApplications())
    }
  }, [isAuthenticated, user?.role, loadAdminStats, dispatch])

  return (
    <Container className="py-2 mb-0">
          <Row className="align-items-center mb-3">
            <Col md={6} className="ps-4">
              <h1 className="display-5 fw-bold text-primary mb-3">Online License Portal</h1>
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
            
            <Col md={3} className="p-0">
              <img 
                src="/images/govtimg.png" 
                alt="Government Logo" 
                className="img-fluid w-100"
                style={{ maxHeight: '300px', objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x300/007bff/ffffff?text=Government+Logo'
                }}
              />
            </Col>
            
            <Col md={3} className="p-0 text-center">
              <img 
                src="/images/jagan.png" 
                alt="Jagan" 
                className="img-fluid w-100"
                style={{ maxHeight: '300px', objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x300/28a745/ffffff?text=Jagan'
                }}
              />
              <div className="mt-2">
                <div className="fw-bold text-primary">Honorable Chief Minister</div>
                <div className="fw-bold">YS Jagan Mohan Reddy</div>
                
              </div>
            </Col>
          </Row>

          {/* Service Cards - Different for Admin vs Regular Users */}
          {isAuthenticated && user?.role === UserRole.Admin ? (
            <Row className="g-3">
              <Col md={3} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <i className="bi bi-building text-primary mb-2" style={{fontSize: '2rem'}}></i>
                    <Card.Title className="h6">Total Departments</Card.Title>
                    <Card.Text className="text-muted small">
                      {adminStats.totalDepartments} departments
                    </Card.Text>
                    <Link 
                      to="/departments" 
                      className="btn btn-primary btn-sm w-100 text-decoration-none"
                    >
                      Manage Departments
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={3} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <i className="bi bi-file-earmark-text text-success mb-2" style={{fontSize: '2rem'}}></i>
                    <Card.Title className="h6">License Types</Card.Title>
                    <Card.Text className="text-muted small">
                      {adminStats.totalLicenseTypes} license types
                    </Card.Text>
                    <Link 
                      to="/admin/documents" 
                      className="btn btn-success btn-sm w-100 text-decoration-none"
                    >
                      Manage Licenses
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={3} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <i className="bi bi-people text-info mb-2" style={{fontSize: '2rem'}}></i>
                    <Card.Title className="h6">Total Users</Card.Title>
                    <Card.Text className="text-muted small">
                      {adminStats.totalUsers} registered users
                    </Card.Text>
                    <Link 
                      to="/admin/users" 
                      className="btn btn-info btn-sm w-100 text-decoration-none"
                    >
                      Manage Users
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={3} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <i className="bi bi-person-check text-warning mb-2" style={{fontSize: '2rem'}}></i>
                    <Card.Title className="h6">Active Reviewers</Card.Title>
                    <Card.Text className="text-muted small">
                      {adminStats.totalReviewers} active reviewers
                    </Card.Text>
                    <Link 
                      to="/admin/users" 
                      className="btn btn-warning btn-sm w-100 text-decoration-none"
                    >
                      View Reviewers
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ) : isAuthenticated && user?.role === UserRole.DepartmentHead ? (
            <Row className="g-3">
              <Col md={3} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <i className="bi bi-clock-history text-warning mb-2" style={{fontSize: '2rem'}}></i>
                    <Card.Title className="h6">Need Approval</Card.Title>
                    <Card.Text className="text-muted small">
                      Applications waiting for approval
                    </Card.Text>
                    <Link 
                      to="/department-head/need-approval" 
                      className="btn btn-warning btn-sm w-100 text-decoration-none"
                    >
                      Review & Approve
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={3} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <i className="bi bi-check-circle text-success mb-2" style={{fontSize: '2rem'}}></i>
                    <Card.Title className="h6">Approved</Card.Title>
                    <Card.Text className="text-muted small">
                      Applications approved by me
                    </Card.Text>
                    <Link 
                      to="/department-head/approved" 
                      className="btn btn-success btn-sm w-100 text-decoration-none"
                    >
                      View Approved
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={3} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <i className="bi bi-x-circle text-danger mb-2" style={{fontSize: '2rem'}}></i>
                    <Card.Title className="h6">Rejected</Card.Title>
                    <Card.Text className="text-muted small">
                      Applications rejected by me
                    </Card.Text>
                    <Link 
                      to="/department-head/rejected" 
                      className="btn btn-danger btn-sm w-100 text-decoration-none"
                    >
                      View Rejected
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={3} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <i className="bi bi-people text-info mb-2" style={{fontSize: '2rem'}}></i>
                    <Card.Title className="h6">Reviewers</Card.Title>
                    <Card.Text className="text-muted small">
                      Manage department reviewers
                    </Card.Text>
                    <Link 
                      to="/department-head/reviewers" 
                      className="btn btn-info btn-sm w-100 text-decoration-none"
                    >
                      View Reviewers
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ) : isAuthenticated && user?.role === UserRole.Reviewer ? (
            <Row className="g-3">
              <Col md={4} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <i className="bi bi-file-earmark-check text-primary mb-2" style={{fontSize: '2rem'}}></i>
                    <Card.Title className="h6">Applications</Card.Title>
                    <Card.Text className="text-muted small">
                      Review and manage applications
                    </Card.Text>
                    <Link 
                      to="/reviewer" 
                      className="btn btn-primary btn-sm w-100 text-decoration-none"
                    >
                      View Applications
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4} sm={6}>
                <div className={`flip-card h-100 ${showStatsDetails ? 'flipped' : ''}`} style={{cursor: 'pointer'}} onClick={() => setShowStatsDetails(!showStatsDetails)}>
                  <div className="flip-card-inner">
                    <Card className="flip-card-front h-100 text-center border-0 shadow-sm">
                      <Card.Body className="p-3">
                        <i className="bi bi-bar-chart text-success mb-2" style={{fontSize: '2rem'}}></i>
                        <Card.Title className="h6">Statistics</Card.Title>
                        <Card.Text className="text-muted small">
                          View your review statistics
                        </Card.Text>
                        <div className="btn btn-success btn-sm w-100">
                          View Stats
                        </div>
                      </Card.Body>
                    </Card>
                    <Card className="flip-card-back h-100 text-center border-0 shadow-sm">
                      <Card.Body className="p-3 d-flex flex-column justify-content-center">
                        <div className="mb-2 d-flex align-items-center justify-content-center">
                          <i className="bi bi-clock text-warning me-2" style={{fontSize: '1.2rem'}}></i>
                          <span className="text-muted small">Under Review: {applications.filter(app => app.status === 3).length}</span>
                        </div>
                        <div className="mb-2 d-flex align-items-center justify-content-center">
                          <i className="bi bi-check-circle text-success me-2" style={{fontSize: '1.2rem'}}></i>
                          <span className="text-muted small">Verified: {applications.filter(app => [4, 8].includes(app.status)).length}</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-center">
                          <i className="bi bi-x-circle text-danger me-2" style={{fontSize: '1.2rem'}}></i>
                          <span className="text-muted small">Rejected: {applications.filter(app => app.status === 5).length}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </Col>
              
              <Col md={4} sm={6}>
                <div className={`flip-card h-100 ${showReviewerSupportDetails ? 'flipped' : ''}`} style={{cursor: 'pointer'}} onClick={() => setShowReviewerSupportDetails(!showReviewerSupportDetails)}>
                  <div className="flip-card-inner">
                    <Card className="flip-card-front h-100 text-center border-0 shadow-sm">
                      <Card.Body className="p-3">
                        <i className="bi bi-headset text-info mb-2" style={{fontSize: '2rem'}}></i>
                        <Card.Title className="h6">Customer Support</Card.Title>
                        <Card.Text className="text-muted small">
                          Get help and support
                        </Card.Text>
                        <div className="btn btn-info btn-sm w-100">
                          Contact Support
                        </div>
                      </Card.Body>
                    </Card>
                    <Card className="flip-card-back h-100 text-center border-0 shadow-sm">
                      <Card.Body className="p-3 d-flex flex-column justify-content-center">
                        <div className="mb-2 d-flex align-items-center justify-content-center">
                          <i className="bi bi-envelope text-primary me-2" style={{fontSize: '1.5rem'}}></i>
                          <span className="text-muted small">apgovtlisence@gmail.com</span>
                        </div>
                        <div className="mb-2 d-flex align-items-center justify-content-center">
                          <i className="bi bi-telephone text-success me-2" style={{fontSize: '1.5rem'}}></i>
                          <span className="text-muted small">9876543221</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-center">
                          <i className="bi bi-geo-alt text-info me-2" style={{fontSize: '1.5rem'}}></i>
                          <span className="text-muted small">Amaravati, AP</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </Col>
            </Row>
          ) : (
            <Row className="g-3">
              <Col md={3} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <i className="bi bi-building text-primary mb-2" style={{fontSize: '2rem'}}></i>
                    <Card.Title className="h6">Departments</Card.Title>
                    <Card.Text className="text-muted small">
                      Browse government departments
                    </Card.Text>
                    <Link 
                      to={isAuthenticated ? "/departments" : "/login"} 
                      className="btn btn-primary btn-sm w-100 text-decoration-none"
                    >
                      View Departments
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={3} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <i className="bi bi-file-earmark-text text-success mb-2" style={{fontSize: '2rem'}}></i>
                    <Card.Title className="h6">License Types</Card.Title>
                    <Card.Text className="text-muted small">
                      Explore available licenses
                    </Card.Text>
                    <Link 
                      to={isAuthenticated ? "/departments" : "/login"} 
                      className="btn btn-success btn-sm w-100 text-decoration-none"
                    >
                      Browse Licenses
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={3} sm={6}>
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <i className="bi bi-award text-warning mb-2" style={{fontSize: '2rem'}}></i>
                    <Card.Title className="h6">Digital Certification</Card.Title>
                    <Card.Text className="text-muted small">
                      Access digital certificates
                    </Card.Text>
                    <Link 
                      to={isAuthenticated ? "/my-applications" : "/login"} 
                      className="btn btn-warning btn-sm w-100 text-decoration-none"
                    >
                      My Certificates
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={3} sm={6}>
                <div className={`flip-card h-100 ${showSupportDetails ? 'flipped' : ''}`} style={{cursor: 'pointer'}} onClick={() => setShowSupportDetails(!showSupportDetails)}>
                  <div className="flip-card-inner">
                    <Card className="flip-card-front h-100 text-center border-0 shadow-sm">
                      <Card.Body className="p-3">
                        <i className="bi bi-headset text-info mb-2" style={{fontSize: '2rem'}}></i>
                        <Card.Title className="h6">Customer Support</Card.Title>
                        <Card.Text className="text-muted small">
                          Get help and support
                        </Card.Text>
                        <div className="btn btn-info btn-sm w-100">
                          Contact Support
                        </div>
                      </Card.Body>
                    </Card>
                    <Card className="flip-card-back h-100 text-center border-0 shadow-sm">
                      <Card.Body className="p-3 d-flex flex-column justify-content-center">
                        <div className="mb-2 d-flex align-items-center justify-content-center">
                          <i className="bi bi-envelope text-primary me-2" style={{fontSize: '1.5rem'}}></i>
                          <span className="text-muted small">apgovtlisence@gmail.com</span>
                        </div>
                        <div className="mb-2 d-flex align-items-center justify-content-center">
                          <i className="bi bi-telephone text-success me-2" style={{fontSize: '1.5rem'}}></i>
                          <span className="text-muted small">9876543221</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-center">
                          <i className="bi bi-geo-alt text-info me-2" style={{fontSize: '1.5rem'}}></i>
                          <span className="text-muted small">Amaravati, AP</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </Col>
            </Row>
          )}

          {/* Scrolling Instructions */}
          <div className="mt-3 mb-0 py-2 bg-light rounded">
            <div className="overflow-hidden">
              <div className="d-flex animate-scroll">
                {isAuthenticated && (user?.role === UserRole.Reviewer || user?.role === UserRole.DepartmentHead) ? (
                  <>
                    <div className="flex-shrink-0 text-center mx-3">
                      <i className="bi bi-1-circle-fill text-primary mb-1" style={{fontSize: '1.5rem'}}></i>
                      <h6>Select Application</h6>
                    </div>
                    <div className="flex-shrink-0 text-center mx-3">
                      <i className="bi bi-2-circle-fill text-success mb-1" style={{fontSize: '1.5rem'}}></i>
                      <h6>Review Documents</h6>
                    </div>
                    <div className="flex-shrink-0 text-center mx-3">
                      <i className="bi bi-3-circle-fill text-warning mb-1" style={{fontSize: '1.5rem'}}></i>
                      <h6>Verify Details</h6>
                    </div>
                    <div className="flex-shrink-0 text-center mx-3">
                      <i className="bi bi-4-circle-fill text-info mb-1" style={{fontSize: '1.5rem'}}></i>
                      <h6>Approve/Reject</h6>
                    </div>
                    {/* Repeat for continuous scroll */}
                    <div className="flex-shrink-0 text-center mx-3">
                      <i className="bi bi-1-circle-fill text-primary mb-1" style={{fontSize: '1.5rem'}}></i>
                      <h6>Select Application</h6>
                    </div>
                    <div className="flex-shrink-0 text-center mx-3">
                      <i className="bi bi-2-circle-fill text-success mb-1" style={{fontSize: '1.5rem'}}></i>
                      <h6>Review Documents</h6>
                    </div>
                    <div className="flex-shrink-0 text-center mx-3">
                      <i className="bi bi-3-circle-fill text-warning mb-1" style={{fontSize: '1.5rem'}}></i>
                      <h6>Verify Details</h6>
                    </div>
                    <div className="flex-shrink-0 text-center mx-3">
                      <i className="bi bi-4-circle-fill text-info mb-1" style={{fontSize: '1.5rem'}}></i>
                      <h6>Approve/Reject</h6>
                    </div>
                    <div className="flex-shrink-0 text-center mx-3">
                      <i className="bi bi-1-circle-fill text-primary mb-1" style={{fontSize: '1.5rem'}}></i>
                      <h6>Select Application</h6>
                    </div>
                    <div className="flex-shrink-0 text-center mx-3">
                      <i className="bi bi-2-circle-fill text-success mb-1" style={{fontSize: '1.5rem'}}></i>
                      <h6>Review Documents</h6>
                    </div>
                    <div className="flex-shrink-0 text-center mx-3">
                      <i className="bi bi-3-circle-fill text-warning mb-1" style={{fontSize: '1.5rem'}}></i>
                      <h6>Verify Details</h6>
                    </div>
                    <div className="flex-shrink-0 text-center mx-3">
                      <i className="bi bi-4-circle-fill text-info mb-1" style={{fontSize: '1.5rem'}}></i>
                      <h6>Approve/Reject</h6>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </div>

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
        
        .flip-card {
          perspective: 1000px;
        }
        
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        
        .flip-card.flipped .flip-card-inner {
          transform: rotateY(180deg);
        }
        
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
        }
        
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </Container>
  )
}

export default Home