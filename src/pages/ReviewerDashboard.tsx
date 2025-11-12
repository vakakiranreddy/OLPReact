import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert, Badge, Modal, Form, InputGroup } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { RootState } from '../store'
import { applicationQueryService } from '../services/applicationQueryService'
import { applicationActionService } from '../services/applicationActionService'
import { documentService } from '../services/documentService'
import { paymentService } from '../services/paymentService'
import type { ApplicationListItem, ApplicationDetails, VerifyApplicationRequest, RejectApplicationRequest, DocumentResponse, PaymentDetails } from '../types'

const ReviewerDashboard: React.FC = () => {
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
  const [verifyRemarks, setVerifyRemarks] = useState('')
  const [activeTab, setActiveTab] = useState('applications')
  const [activeFilter, setActiveFilter] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [statistics, setStatistics] = useState<{ userId: number, applicationCount: number } | null>(null)
  const [previewDoc, setPreviewDoc] = useState<DocumentResponse | null>(null)

  useEffect(() => {
    fetchPendingApplications()
  }, [])
  
  useEffect(() => {
    // Set tab and filter based on current URL
    const path = location.pathname
    if (path.includes('/statistics')) {
      setActiveTab('statistics')
    } else {
      setActiveTab('applications')
      if (path.includes('/verified')) {
        setActiveFilter('verified')
      } else if (path.includes('/rejected')) {
        setActiveFilter('rejected')
      } else {
        setActiveFilter('pending')
      }
    }
  }, [location.pathname])

  useEffect(() => {
    filterApplications()
  }, [applications, activeFilter, searchTerm])

  const fetchPendingApplications = async () => {
    try {
      const [pendingData, reviewedData] = await Promise.all([
        applicationQueryService.getMyPendingReviews(),
        applicationQueryService.getMyReviewedApplications()
      ])
      
      const allApplications = [...pendingData, ...reviewedData]
      const uniqueApplications = allApplications.filter((app, index, self) => 
        index === self.findIndex(a => a.applicationId === app.applicationId)
      )
      
      setApplications(uniqueApplications)
      
      // Fetch statistics
      const stats = await applicationQueryService.getMyStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = applications
    
    switch (activeFilter) {
      case 'pending':
        filtered = applications.filter(app => app.status === 3) // UnderReview
        break
      case 'verified':
        filtered = applications.filter(app => [4, 8].includes(app.status)) // Verified, Approved
        break
      case 'reviewed':
        filtered = applications.filter(app => [4, 5, 8].includes(app.status)) // Verified, Rejected, Approved
        break
      case 'rejected':
        filtered = applications.filter(app => app.status === 5) // Rejected
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

  const handleVerify = async () => {
    if (!selectedApp) return
    
    try {
      const verifyData: VerifyApplicationRequest = {
        ApplicationId: selectedApp.applicationId,
        VerificationRemarks: verifyRemarks
      }
      
      await applicationActionService.verify(verifyData)
      alert('Application verified successfully!')
      setShowModal(false)
      fetchPendingApplications()
    } catch (error) {
      console.error('Error verifying application:', error)
      alert('Error verifying application')
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
      fetchPendingApplications()
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
        const base64String = base64Data.split(',')[1] // Remove data:type;base64, prefix
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
      <h2 className="mb-4">Reviewer Dashboard</h2>
      

      
      {(activeTab === 'applications' || location.pathname.includes('/reviewer')) && !location.pathname.includes('/statistics') && (
        <>
          {/* Search Bar */}
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
                  <strong>Applied:</strong> {new Date(app.appliedDate).toLocaleDateString()}
                </Card.Text>
                <Button 
                  variant="primary" 
                  onClick={() => handleViewApplication(app.applicationId)}
                >
                  Review
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

          {filteredApplications.length === 0 && (
            <Alert variant="info">
              {activeFilter === 'pending' && 'No applications under review.'}
              {activeFilter === 'verified' && 'No verified applications.'}
              {activeFilter === 'rejected' && 'No rejected applications.'}
            </Alert>
          )}
        </>
      )}
      
      {activeTab === 'statistics' && (
        <>
          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-warning">{applications.filter(app => app.status === 3).length}</h3>
                  <p>Pending Review</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-success">{applications.filter(app => [4, 8].includes(app.status)).length}</h3>
                  <p>Verified/Approved</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-danger">{applications.filter(app => app.status === 5).length}</h3>
                  <p>Rejected</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {statistics && (
            <Card>
              <Card.Header><h5>My Review Statistics</h5></Card.Header>
              <Card.Body>
                <p><strong>Total Applications Reviewed:</strong> {statistics.applicationCount}</p>
                <p><strong>Department:</strong> {user?.departmentName || 'N/A'}</p>
                <p><strong>Current Workload:</strong> {applications.filter(app => app.status === 3).length} pending reviews</p>
              </Card.Body>
            </Card>
          )}
        </>
      )}

      {/* Application Review Modal */}
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
                    {selectedApp.applicantRemarks && (
                      <p><strong>Remarks:</strong> {selectedApp.applicantRemarks}</p>
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
          {selectedApp?.status === 3 && (
            <Form.Group className="me-auto" style={{ minWidth: '200px' }}>
              <Form.Control
                type="text"
                placeholder="Verification remarks (optional)"
                value={verifyRemarks}
                onChange={(e) => setVerifyRemarks(e.target.value)}
              />
            </Form.Group>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {selectedApp?.status === 3 && (
            <>
              <Button 
                variant="danger" 
                onClick={() => setShowRejectModal(true)}
              >
                Reject
              </Button>
              <Button variant="success" onClick={handleVerify}>
                Verify
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
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

export default ReviewerDashboard