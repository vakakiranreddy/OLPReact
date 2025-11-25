import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert, Badge, Modal, Form, Table, InputGroup } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { RootState, AppDispatch } from '../../app/store'
import { applicationQueryService } from '../../services/applicationQueryService'
import { setSelectedApplication, setApplications } from '../../app/store/slices/applicationSlice'
import { setDocuments } from '../../app/store/slices/documentSlice'
import { setLoading, setSearchTerm, openModal, closeModal, setActiveFilter } from '../../app/store/slices/uiSlice'
import { showError, showSuccess } from '../../app/store/slices/notificationSlice'
import { approveApplication, rejectApplication } from '../../app/store/thunks/applicationThunks'
import { useApplications, useDocuments } from '../../hooks'
import { getStatusText, getStatusColor, isImageFile, isPdfFile } from '../../utils'
import { broadcastNotificationService } from '../../services/broadcastNotificationService'
import { userNotificationService } from '../../services/userNotificationService'
import type { ApproveApplicationRequest, RejectApplicationRequest, DocumentResponse, PaymentDetails, UserResponse, ApplicationListItem } from '../../types'

interface DepartmentHeadDashboardProps {
  filter?: 'needApproval' | 'approved' | 'rejected'
  tab?: 'applications' | 'reviewers'
}

interface ReviewerStats {
  userId: number
  name: string
  email: string
  assignedCount: number
  approvedCount: number
  rejectedCount: number
  pendingCount: number
}

const DepartmentHeadDashboard: React.FC<DepartmentHeadDashboardProps> = () => {
  const location = useLocation()

  const { selectedApplication: selectedApp } = useSelector((state: RootState) => state.applications)
  const { user } = useSelector((state: RootState) => state.auth)
  const { loading, modals } = useSelector((state: RootState) => state.ui)
  const { applications, filteredApplications, activeFilter, searchTerm } = useApplications()
  const { documents } = useSelector((state: RootState) => state.documents)
  const { previewDoc, handleDownload, handleViewDocument, hidePreview } = useDocuments()
  const dispatch = useDispatch<AppDispatch>()
  const [paymentInfo, setPaymentInfo] = useState<PaymentDetails | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [approvalRemarks, setApprovalRemarks] = useState('')

  const [reviewers, setReviewers] = useState<UserResponse[]>([])
  const [reviewerStats, setReviewerStats] = useState<ReviewerStats[]>([])
  const [selectedReviewer, setSelectedReviewer] = useState<UserResponse | null>(null)
  const [reviewerApplications, setReviewerApplications] = useState<ApplicationListItem[]>([])
  const [currentTab, setCurrentTab] = useState<'applications' | 'reviewers' | 'broadcast'>('applications')
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationTarget, setNotificationTarget] = useState<'individual' | 'broadcast'>('individual')
  const [targetReviewer, setTargetReviewer] = useState<UserResponse | null>(null)
  const [sendingNotification, setSendingNotification] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [loadingApplicationId, setLoadingApplicationId] = useState<number | null>(null)


  
  const showModal = modals['applicationModal'] || false

  useEffect(() => {
    fetchDashboardData()
  }, [dispatch, user?.departmentId])

  useEffect(() => {
    // Set tab based on current route
    if (location.pathname.includes('/reviewers')) {
      setCurrentTab('reviewers')
    } else if (location.pathname.includes('/broadcast')) {
      setCurrentTab('broadcast')
    } else {
      setCurrentTab('applications')
      // Set filter based on route
      if (location.pathname.includes('/need-approval')) {
        dispatch(setActiveFilter('needApproval'))
      } else if (location.pathname.includes('/approved')) {
        dispatch(setActiveFilter('approved'))
      } else if (location.pathname.includes('/rejected')) {
        dispatch(setActiveFilter('rejected'))
      } else {
        dispatch(setActiveFilter('needApproval'))
      }
    }
  }, [location.pathname, dispatch])

  const fetchDashboardData = async () => {
    try {
      dispatch(setLoading(true))
      const dashboardData = await applicationQueryService.getDepartmentHeadDashboard()
      
      // Update applications in store
      dispatch(setApplications(dashboardData.applications))
      
      setReviewers(dashboardData.reviewers)
      
      // Calculate reviewer statistics
      const reviewerStatsData: ReviewerStats[] = dashboardData.reviewers.map((reviewer: UserResponse) => {
        const reviewerApps = dashboardData.applications.filter((app: ApplicationListItem) => app.reviewerId === reviewer.userId)
        return {
          userId: reviewer.userId,
          name: `${reviewer.firstName} ${reviewer.lastName}`,
          email: reviewer.email,
          assignedCount: reviewerApps.length,
          approvedCount: reviewerApps.filter((app: ApplicationListItem) => app.status === 8).length,
          rejectedCount: reviewerApps.filter((app: ApplicationListItem) => app.status === 5).length,
          pendingCount: reviewerApps.filter((app: ApplicationListItem) => app.status === 3).length
        }
      })
      setReviewerStats(reviewerStatsData)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      dispatch(showError('Failed to load dashboard data'))
    } finally {
      dispatch(setLoading(false))
    }
  }



  const handleViewApplication = async (applicationId: number) => {
    setLoadingApplicationId(applicationId)
    try {
      const reviewDetails = await applicationQueryService.getApplicationReviewDetails(applicationId)
      
      dispatch(setSelectedApplication(reviewDetails.applicationDetails))
      dispatch(setDocuments(reviewDetails.documents))
      setPaymentInfo(reviewDetails.payment)
      dispatch(openModal('applicationModal'))
    } catch (error) {
      console.error('Error fetching application details:', error)
      dispatch(showError('Error loading application details'))
    } finally {
      setLoadingApplicationId(null)
    }
  }

  const handleApprove = async () => {
    if (!selectedApp) return
    
    setIsApproving(true)
    try {
      const approveData: ApproveApplicationRequest = {
        ApplicationId: selectedApp.applicationId,
        ApprovalRemarks: approvalRemarks
      }
      
      await dispatch(approveApplication(approveData))
      dispatch(closeModal('applicationModal'))
      
      // Refresh dashboard data
      fetchDashboardData()
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!selectedApp || !rejectReason.trim()) {
      dispatch(showError('Please provide rejection reason'))
      return
    }
    
    setIsRejecting(true)
    try {
      const rejectData: RejectApplicationRequest = {
        ApplicationId: selectedApp.applicationId,
        RejectionReason: rejectReason
      }
      
      await dispatch(rejectApplication(rejectData))
      setShowRejectModal(false)
      dispatch(closeModal('applicationModal'))
      
      // Refresh dashboard data
      fetchDashboardData()
    } finally {
      setIsRejecting(false)
    }
  }

  const handleViewReviewerApplications = (reviewer: UserResponse) => {
    setSelectedReviewer(reviewer)
    const apps = applications.filter((app: ApplicationListItem) => app.reviewerId === reviewer.userId)
    setReviewerApplications(apps)
  }

  const handleSendNotification = (reviewer: UserResponse) => {
    setTargetReviewer(reviewer)
    setNotificationTarget('individual')
    setShowNotificationModal(true)
  }

  const handleSendNotificationSubmit = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      dispatch(showError('Please fill in all fields'))
      return
    }

    setSendingNotification(true)
    try {
      if (notificationTarget === 'individual' && targetReviewer) {
        await userNotificationService.createNotification({
          title: notificationTitle,
          message: notificationMessage,
          type: 1,
          userId: targetReviewer.userId,
          sendEmail: true
        })
      } else if (notificationTarget === 'broadcast') {
        await broadcastNotificationService.createBroadcast({
          title: notificationTitle,
          message: notificationMessage,
          targetRole: 1,
          targetDepartmentId: user?.departmentId
        })
      }
      
      setShowNotificationModal(false)
      setNotificationTitle('')
      setNotificationMessage('')
      
      const successMessage = notificationTarget === 'individual' 
        ? `Notification sent to ${targetReviewer?.firstName} ${targetReviewer?.lastName}`
        : 'Broadcast notification sent to all reviewers'
      dispatch(showSuccess(successMessage))
    } catch (error) {
      console.error('Error sending notification:', error)
      dispatch(showError('Failed to send notification'))
    } finally {
      setSendingNotification(false)
    }
  }









  const renderDocument = (doc: DocumentResponse) => {
    const isImage = isImageFile(doc.fileType)
    const isPdf = isPdfFile(doc.fileType)
    
    return (
      <Card key={doc.documentId} className="mb-3">
        <Card.Header>
          <strong>{doc.documentName}</strong>
        </Card.Header>
        <Card.Body>
          <div className="d-flex gap-2 mb-2">
            <Button 
              variant="outline-info" 
              size="sm"
              onClick={() => handleViewDocument(doc)}
            >
              View
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => handleDownload(doc)}
            >
              Download
            </Button>
          </div>
          <small className="text-muted">
            Uploaded: {new Date(doc.uploadedDate).toLocaleDateString()}
          </small>
          
          {previewDoc?.documentId === doc.documentId && (
            <div className="mt-3">
              {previewDoc?.fileData ? (
                <>
                  {isImage && (
                    <img 
                      src={`data:${previewDoc?.fileType};base64,${previewDoc?.fileData}`} 
                      alt={previewDoc?.documentName}
                      className="img-fluid"
                      style={{ maxHeight: '400px' }}
                    />
                  )}
                  {isPdf && (
                    <iframe
                      src={`data:application/pdf;base64,${previewDoc?.fileData}`}
                      width="100%"
                      height="500px"
                      title={previewDoc?.documentName}
                    />
                  )}
                  {!isImage && !isPdf && (
                    <div className="alert alert-info">Preview not available for this file type</div>
                  )}
                </>
              ) : (
                <div className="alert alert-warning">Loading preview...</div>
              )}
              <div className="mt-2">
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={hidePreview}
                >
                  Hide Preview
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    )
  }

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">Loading applications...</div>
      </Container>
    )
  }

  const getFilteredCount = () => {
    if (activeFilter === 'needApproval') return applications.filter(app => app.status === 4).length
    if (activeFilter === 'approved') return applications.filter(app => app.status === 8).length
    if (activeFilter === 'rejected') return applications.filter(app => app.status === 5).length
    return applications.length
  }

  const getFilterTitle = () => {
    if (activeFilter === 'needApproval') return 'Need Approval'
    if (activeFilter === 'approved') return 'Approved'
    if (activeFilter === 'rejected') return 'Rejected'
    return 'Applications'
  }



  const renderReviewersTab = () => (
    <>
      <Row className="mb-4">
        <Col>
          <h4>Department Reviewers</h4>
          <p className="text-muted">Manage reviewers and view their workload statistics</p>
        </Col>
      </Row>
      
      <Row>
        {reviewerStats.map((reviewer) => (
          <Col md={3} key={reviewer.userId} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title className="h6">{reviewer.name}</Card.Title>
                <Card.Text>
                  <small className="text-muted">{reviewer.email}</small>
                </Card.Text>
                
                <div className="mb-3 p-2 bg-light rounded">
                  <div className="d-flex justify-content-between mb-1">
                    <small>Total Assigned:</small>
                    <span>{reviewer.assignedCount}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <small>Pending Review:</small>
                    <span>{reviewer.pendingCount}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <small>Approved:</small>
                    <span>{reviewer.approvedCount}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <small>Rejected:</small>
                    <span>{reviewer.rejectedCount}</span>
                  </div>
                </div>
                
                <div className="d-grid gap-1">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => handleViewReviewerApplications(reviewers.find(r => r.userId === reviewer.userId)!)}
                  >
                    View Applications
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => handleSendNotification(reviewers.find(r => r.userId === reviewer.userId)!)}
                  >
                    Send Notification
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      {reviewerStats.length === 0 && (
        <Alert variant="info">
          No reviewers found in this department.
        </Alert>
      )}
    </>
  )

  const renderBroadcastTab = () => (
    <>
      <Row className="mb-4">
        <Col>
          <h4>Broadcast Notification</h4>
          <p className="text-muted">Send notifications to all reviewers in your department</p>
        </Col>
      </Row>
      
      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Title *</Form.Label>
                <Form.Control
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="Enter notification title"
                  maxLength={200}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Message *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Enter notification message"
                  maxLength={2000}
                />
              </Form.Group>
              <Alert variant="info">
                This notification will be sent to all reviewers in your department.
              </Alert>
              <Button 
                variant="primary" 
                onClick={() => {
                  setNotificationTarget('broadcast')
                  handleSendNotificationSubmit()
                }}
                disabled={!notificationTitle.trim() || !notificationMessage.trim() || sendingNotification}
              >
                {sendingNotification ? 'Sending...' : 'Send Broadcast Notification'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )

  return (
    <Container className="mt-4">
      {currentTab === 'applications' && (
        <>
          {/* Application Filter Navigation */}
          <Row className="mb-4">
            <Col>
              <div className="d-flex gap-2">
                <Button 
                  variant={activeFilter === 'needApproval' ? 'primary' : 'outline-primary'}
                  onClick={() => dispatch(setActiveFilter('needApproval'))}
                >
                  Need Approval
                </Button>
                <Button 
                  variant={activeFilter === 'approved' ? 'primary' : 'outline-primary'}
                  onClick={() => dispatch(setActiveFilter('approved'))}
                >
                  Approved
                </Button>
                <Button 
                  variant={activeFilter === 'rejected' ? 'primary' : 'outline-primary'}
                  onClick={() => dispatch(setActiveFilter('rejected'))}
                >
                  Rejected
                </Button>
              </div>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by application number, applicant name, or license type..."
                  value={searchTerm}
                  onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="d-flex justify-content-end align-items-center">
              <span className="text-dark fw-bold">
                Total {getFilterTitle()}: {getFilteredCount()}
              </span>
            </Col>
          </Row>
          

          <Row>
            {filteredApplications.map((app) => (
              <Col md={6} lg={4} key={app.applicationId} className="mb-3">
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body className="p-3">
                    <div className="mb-2 p-2 rounded" style={{backgroundColor: '#e3f2fd'}}>
                      <h6 className="mb-1 fw-normal" style={{color: '#1565c0'}}>{app.applicationNumber}</h6>
                      <p className="text-muted mb-0 small">{app.licenseTypeName}</p>
                    </div>
                    <div className="mb-3">
                      <p className="mb-1 small text-dark">{app.applicantName}</p>
                      <p className="mb-1 text-muted" style={{fontSize: '0.75rem'}}>{new Date(app.appliedDate).toLocaleDateString()}</p>
                      {app.reviewerName && (
                        <p className="mb-0 text-muted" style={{fontSize: '0.75rem'}}>Reviewer: {app.reviewerName}</p>
                      )}
                    </div>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleViewApplication(app.applicationId)}
                      className="w-100"
                      disabled={loadingApplicationId === app.applicationId}
                    >
                      {loadingApplicationId === app.applicationId 
                        ? 'Loading...' 
                        : app.status === 4 ? 'Approve/Reject' : 'View Details'
                      }
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      {currentTab === 'reviewers' && renderReviewersTab()}

      {currentTab === 'broadcast' && renderBroadcastTab()}

      {currentTab === 'applications' && filteredApplications.length === 0 && (


        <Alert variant="info">
          {activeFilter === 'needApproval' && 'No applications pending approval.'}
          {activeFilter === 'approved' && 'No approved applications.'}
          {activeFilter === 'rejected' && 'No rejected applications.'}
        </Alert>
      )}

      <Modal show={showModal} onHide={() => { dispatch(closeModal('applicationModal')); hidePreview(); }} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Review Application - {selectedApp?.applicationNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedApp && (
            <Row>
              <Col md={6}>
                <h5>Application Details</h5>
                <Card className="mb-3">
                  <Card.Body>
                    <p><strong>License Type:</strong> {selectedApp.licenseTypeName}</p>
                    <p><strong>Department:</strong> {selectedApp.departmentName}</p>
                    <p><strong>Applicant:</strong> {selectedApp.applicantName}</p>
                    <p><strong>Email:</strong> {selectedApp.applicantEmail}</p>
                    <p><strong>Phone:</strong> {selectedApp.applicantPhone}</p>
                    <p><strong>Applied Date:</strong> {new Date(selectedApp.appliedDate).toLocaleDateString()}</p>
                    {selectedApp.reviewerName && (
                      <p><strong>Reviewer:</strong> {selectedApp.reviewerName}</p>
                    )}
                    {selectedApp.verifiedDate && (
                      <p><strong>Verified Date:</strong> {new Date(selectedApp.verifiedDate).toLocaleDateString()}</p>
                    )}
                    {selectedApp.applicantRemarks && (
                      <p><strong>Applicant Remarks:</strong> {selectedApp.applicantRemarks}</p>
                    )}
                  </Card.Body>
                </Card>

                {paymentInfo && (
                  <Card className="mb-3">
                    <Card.Header><strong>Payment Information</strong></Card.Header>
                    <Card.Body>
                      <p><strong>Amount:</strong> ${paymentInfo.amount}</p>
                      <p><strong>Transaction ID:</strong> {paymentInfo.transactionId || 'N/A'}</p>
                      <p><strong>Payment Date:</strong> {new Date(paymentInfo.paymentDate).toLocaleDateString()}</p>
                      <p><strong>Status:</strong> 
                        <Badge bg="success" className="ms-2">Completed</Badge>
                      </p>
                    </Card.Body>
                  </Card>
                )}
              </Col>
              
              <Col md={6}>
                <h5>Documents</h5>
                {documents.map(renderDocument)}
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedApp?.status === 4 && (
            <Form.Group className="me-auto" style={{ minWidth: '200px' }}>
              <Form.Control
                type="text"
                placeholder="Approval remarks (optional)"
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
              />
            </Form.Group>
          )}
          <Button variant="secondary" onClick={() => dispatch(closeModal('applicationModal'))}>
            Close
          </Button>
          {selectedApp?.status === 4 && (
            <>
              <Button 
                variant="danger" 
                onClick={() => setShowRejectModal(true)}
                disabled={isApproving || isRejecting}
              >
                Reject
              </Button>
              <Button 
                variant="success" 
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
              >
                {isApproving ? 'Approving...' : 'Approve'}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Rejection Reason *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide reason for rejection..."
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleReject}
            disabled={!rejectReason.trim() || isRejecting}
          >
            {isRejecting ? 'Rejecting...' : 'Reject Application'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reviewer Applications Modal */}
      <Modal show={!!selectedReviewer} onHide={() => setSelectedReviewer(null)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Applications - {selectedReviewer?.firstName} {selectedReviewer?.lastName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewerApplications.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Application #</th>
                  <th>License Type</th>
                  <th>Applicant</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviewerApplications.map((app) => (
                  <tr key={app.applicationId}>
                    <td>{app.applicationNumber}</td>
                    <td>{app.licenseTypeName}</td>
                    <td>{app.applicantName}</td>
                    <td>
                      <span className={`text-${getStatusColor(app.status)}`}>
                        {getStatusText(app.status)}
                      </span>
                    </td>
                    <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleViewApplication(app.applicationId)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">
              No applications assigned to this reviewer.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedReviewer(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Send Notification Modal */}
      <Modal show={showNotificationModal} onHide={() => setShowNotificationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {notificationTarget === 'individual' 
              ? `Send Notification to ${targetReviewer?.firstName} ${targetReviewer?.lastName}`
              : 'Broadcast to All Reviewers'
            }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Title *</Form.Label>
            <Form.Control
              type="text"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              placeholder="Enter notification title"
              maxLength={200}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Message *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder="Enter notification message"
              maxLength={2000}
            />
          </Form.Group>
          {notificationTarget === 'broadcast' && (
            <Alert variant="info">
              This notification will be sent to all reviewers in your department.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotificationModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSendNotificationSubmit}
            disabled={!notificationTitle.trim() || !notificationMessage.trim() || sendingNotification}
          >
            {sendingNotification ? 'Sending...' : 'Send Notification'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  )
}

export default DepartmentHeadDashboard