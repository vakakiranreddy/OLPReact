import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert, Badge, Modal, Form, Nav, Table, InputGroup } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { RootState } from '../store'
import { applicationQueryService } from '../services/applicationQueryService'
import { applicationActionService } from '../services/applicationActionService'
import { documentService } from '../services/documentService'
import { paymentService } from '../services/paymentService'
import { userService } from '../services/userService'
import type { ApplicationListItem, ApplicationDetails, ApproveApplicationRequest, RejectApplicationRequest, DocumentResponse, PaymentDetails, UserResponse } from '../types'

interface DepartmentHeadDashboardProps {
  filter?: 'needApproval' | 'approved' | 'rejected' | 'underReview'
  tab?: 'applications' | 'statistics' | 'reviewers'
}

const DepartmentHeadDashboard: React.FC<DepartmentHeadDashboardProps> = ({ filter, tab }) => {
  const { user } = useSelector((state: RootState) => state.auth)
  const location = useLocation()
  const [applications, setApplications] = useState<ApplicationListItem[]>([])
  const [filteredApplications, setFilteredApplications] = useState<ApplicationListItem[]>([])
  const [selectedApp, setSelectedApp] = useState<ApplicationDetails | null>(null)
  const [documents, setDocuments] = useState<DocumentResponse[]>([])
  const [paymentInfo, setPaymentInfo] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [approvalRemarks, setApprovalRemarks] = useState('')
  const [activeTab, setActiveTab] = useState('applications')
  const [activeFilter, setActiveFilter] = useState('needApproval')
  const [previewDoc, setPreviewDoc] = useState<DocumentResponse | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statistics, setStatistics] = useState<{ userId: number, applicationCount: number } | null>(null)
  const [statusCounts, setStatusCounts] = useState<{ [key: number]: number }>({})
  const [reviewers, setReviewers] = useState<UserResponse[]>([])
  const [reviewerStats, setReviewerStats] = useState<{ [key: number]: number }>({})

  useEffect(() => {
    fetchApplications()
  }, [])
  
  useEffect(() => {
    // Set tab and filter based on current URL
    const path = location.pathname
    if (path.includes('/statistics')) {
      setActiveTab('statistics')
    } else if (path.includes('/reviewers')) {
      setActiveTab('reviewers')
    } else {
      setActiveTab('applications')
      if (path.includes('/approved')) {
        setActiveFilter('approved')
      } else if (path.includes('/rejected')) {
        setActiveFilter('rejected')
      } else {
        setActiveFilter('needApproval')
      }
    }
  }, [location.pathname])

  useEffect(() => {
    filterApplications()
  }, [applications, activeFilter, searchTerm])

  const fetchApplications = async () => {
    try {
      const data = await applicationQueryService.getAllApplications()
      setApplications(data)
      
      const stats = await applicationQueryService.getMyStatistics()
      setStatistics(stats)
      
      const counts: { [key: number]: number } = {}
      for (const status of [3, 4, 5, 8]) {
        try {
          const result = await applicationQueryService.getApplicationCountByStatus(status)
          counts[status] = result.count
        } catch {
          counts[status] = 0
        }
      }
      setStatusCounts(counts)
      
      // Fetch reviewers in department (UserRole.Reviewer = 1)
      const departmentReviewers = await userService.getUsersByRole(1)
      setReviewers(departmentReviewers)
      
      // Get reviewer workload statistics
      const reviewerWorkload: { [key: number]: number } = {}
      for (const reviewer of departmentReviewers) {
        const reviewerApps = data.filter(app => app.reviewerId === reviewer.userId && app.status === 3)
        reviewerWorkload[reviewer.userId] = reviewerApps.length
      }
      setReviewerStats(reviewerWorkload)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = applications
    
    switch (activeFilter) {
      case 'needApproval':
        filtered = applications.filter(app => app.status === 4)
        break
      case 'approved':
        filtered = applications.filter(app => app.status === 8)
        break
      case 'rejected':
        filtered = applications.filter(app => app.status === 5)
        break
      case 'underReview':
        filtered = applications.filter(app => app.status === 3)
        break
      default:
        filtered = applications
    }
    
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.licenseTypeName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredApplications(filtered)
  }

  const handleViewApplication = async (applicationId: number) => {
    try {
      const appDetails = await applicationQueryService.getApplicationDetails(applicationId)
      const appDocuments = await documentService.getApplicationDocuments(applicationId)
      const payment = await paymentService.getByApplicationId(applicationId)
      
      setSelectedApp(appDetails)
      setDocuments(appDocuments)
      setPaymentInfo(payment)
      setShowModal(true)
    } catch (error) {
      console.error('Error fetching application details:', error)
      alert('Error loading application details')
    }
  }

  const handleApprove = async () => {
    if (!selectedApp) return
    
    try {
      const approveData: ApproveApplicationRequest = {
        ApplicationId: selectedApp.applicationId,
        ApprovalRemarks: approvalRemarks
      }
      
      await applicationActionService.approve(approveData)
      alert('Application approved successfully!')
      setShowModal(false)
      fetchApplications()
    } catch (error) {
      console.error('Error approving application:', error)
      alert('Error approving application')
    }
  }

  const handleReject = async () => {
    if (!selectedApp || !rejectReason.trim()) {
      alert('Please provide rejection reason')
      return
    }
    
    try {
      const rejectData: RejectApplicationRequest = {
        ApplicationId: selectedApp.applicationId,
        RejectionReason: rejectReason
      }
      
      await applicationActionService.reject(rejectData)
      alert('Application rejected successfully!')
      setShowRejectModal(false)
      setShowModal(false)
      fetchApplications()
    } catch (error) {
      console.error('Error rejecting application:', error)
      alert('Error rejecting application')
    }
  }

  const getStatusText = (status: number) => {
    const statusMap: { [key: number]: string } = {
      0: 'Draft', 1: 'Pending', 2: 'Submitted', 3: 'Under Review', 4: 'Verified', 5: 'Rejected', 6: 'Payment Pending', 7: 'Pending Approval', 8: 'Approved'
    }
    return statusMap[status] || 'Unknown'
  }

  const getStatusColor = (status: number) => {
    const colorMap: { [key: number]: string } = {
      0: 'secondary', 1: 'info', 2: 'primary', 3: 'warning', 4: 'info', 5: 'danger', 6: 'warning', 7: 'info', 8: 'success'
    }
    return colorMap[status] || 'secondary'
  }

  const handleDownload = async (doc: DocumentResponse) => {
    try {
      const blob = await documentService.downloadDocument(doc.documentId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = doc.fileName || doc.documentName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
      alert('Error downloading document')
    }
  }

  const handleViewDocument = async (doc: DocumentResponse) => {
    try {
      const blob = await documentService.downloadDocument(doc.documentId)
      const reader = new FileReader()
      reader.onload = () => {
        const base64Data = reader.result as string
        const base64String = base64Data.split(',')[1]
        const docWithData = { ...doc, fileData: base64String }
        setPreviewDoc(docWithData)
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Error loading document for preview:', error)
      alert('Error loading document preview')
    }
  }

  const renderDocument = (doc: DocumentResponse) => {
    const isImage = doc.fileType?.startsWith('image/')
    const isPdf = doc.fileType === 'application/pdf'
    
    return (
      <Card key={doc.documentId} className="mb-3">
        <Card.Header>
          <strong>{doc.documentName}</strong>
          <Badge bg="info" className="ms-2">{doc.fileSizeFormatted}</Badge>
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
              {previewDoc.fileData ? (
                <>
                  {isImage && (
                    <img 
                      src={`data:${previewDoc.fileType};base64,${previewDoc.fileData}`} 
                      alt={previewDoc.documentName}
                      className="img-fluid"
                      style={{ maxHeight: '400px' }}
                    />
                  )}
                  {isPdf && (
                    <iframe
                      src={`data:application/pdf;base64,${previewDoc.fileData}`}
                      width="100%"
                      height="500px"
                      title={previewDoc.documentName}
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
                  onClick={() => setPreviewDoc(null)}
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

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Department Head Dashboard</h2>
      

      
      {activeTab === 'applications' && (
        <>
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by application number, applicant name, or license type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
          

          
          <Row>
            {filteredApplications.map((app) => (
              <Col md={6} lg={4} key={app.applicationId} className="mb-4">
                <Card>
                  <Card.Body>
                    <Card.Title className="d-flex justify-content-between align-items-start">
                      <span>{app.applicationNumber}</span>
                      <Badge bg={getStatusColor(app.status)}>
                        {getStatusText(app.status)}
                      </Badge>
                    </Card.Title>
                    <Card.Text>
                      <strong>License:</strong> {app.licenseTypeName}<br />
                      <strong>Applicant:</strong> {app.applicantName}<br />
                      <strong>Applied:</strong> {new Date(app.appliedDate).toLocaleDateString()}<br />
                      {app.reviewerName && (
                        <><strong>Reviewer:</strong> {app.reviewerName}<br /></>
                      )}
                    </Card.Text>
                    <Button 
                      variant="primary" 
                      onClick={() => handleViewApplication(app.applicationId)}
                    >
                      {app.status === 4 ? 'Approve/Reject' : 'View Details'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {filteredApplications.length === 0 && (
            <Alert variant="info">
              {activeFilter === 'needApproval' && 'No applications pending approval.'}
              {activeFilter === 'underReview' && 'No applications under review.'}
              {activeFilter === 'approved' && 'No approved applications.'}
              {activeFilter === 'rejected' && 'No rejected applications.'}
            </Alert>
          )}
        </>
      )}
      
      {activeTab === 'statistics' && (
        <>
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-primary">{statusCounts[3] || 0}</h3>
                  <p>Under Review</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-warning">{statusCounts[4] || 0}</h3>
                  <p>Need Approval</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-success">{statusCounts[8] || 0}</h3>
                  <p>Approved</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-danger">{statusCounts[5] || 0}</h3>
                  <p>Rejected</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {statistics && (
            <Card>
              <Card.Header><h5>My Statistics</h5></Card.Header>
              <Card.Body>
                <p><strong>Total Applications Handled:</strong> {statistics.applicationCount}</p>
                <p><strong>Department:</strong> {user?.departmentName || 'N/A'}</p>
              </Card.Body>
            </Card>
          )}
        </>
      )}
      
      {activeTab === 'reviewers' && (
        <>
          <Row className="mb-4">
            <Col>
              <h4>Department Reviewers Overview</h4>
            </Col>
          </Row>
          
          <Row className="mb-4">
            {reviewers.map(reviewer => (
              <Col md={6} lg={4} key={reviewer.userId} className="mb-3">
                <Card>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-1">{reviewer.firstName} {reviewer.lastName}</h6>
                        <small className="text-muted">{reviewer.email}</small>
                      </div>
                      <Badge bg={reviewer.isActive ? 'success' : 'secondary'}>
                        {reviewer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <hr />
                    <div className="text-center">
                      <h4 className={reviewerStats[reviewer.userId] > 0 ? 'text-warning' : 'text-success'}>
                        {reviewerStats[reviewer.userId] || 0}
                      </h4>
                      <small>Pending Reviews</small>
                    </div>
                    <div className="mt-2">
                      <small className="text-muted">
                        Status: {reviewerStats[reviewer.userId] > 0 ? 'Has Work Assigned' : 'Available'}
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          
          {reviewers.length === 0 && (
            <Alert variant="info">No reviewers found in this department.</Alert>
          )}
          
          <Card className="mt-4">
            <Card.Header><h5>Applications Assignment Details</h5></Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Application #</th>
                    <th>Applicant</th>
                    <th>License Type</th>
                    <th>Reviewer</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.filter(app => app.reviewerName).map(app => (
                    <tr key={app.applicationId}>
                      <td>{app.applicationNumber}</td>
                      <td>{app.applicantName}</td>
                      <td>{app.licenseTypeName}</td>
                      <td>{app.reviewerName}</td>
                      <td>
                        <Badge bg={getStatusColor(app.status)}>
                          {getStatusText(app.status)}
                        </Badge>
                      </td>
                      <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {applications.filter(app => app.reviewerName).length === 0 && (
                <Alert variant="info">No applications assigned to reviewers.</Alert>
              )}
            </Card.Body>
          </Card>
        </>
      )}

      <Modal show={showModal} onHide={() => { setShowModal(false); setPreviewDoc(null); }} size="xl">
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {selectedApp?.status === 4 && (
            <>
              <Button 
                variant="danger" 
                onClick={() => setShowRejectModal(true)}
              >
                Reject
              </Button>
              <Button variant="success" onClick={handleApprove}>
                Approve
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
            disabled={!rejectReason.trim()}
          >
            Reject Application
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default DepartmentHeadDashboard