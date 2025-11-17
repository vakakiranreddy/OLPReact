import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap'
import { useNavigate, useLocation } from 'react-router-dom'
import { requiredDocumentService } from '../services/requiredDocumentService'
import { applicationActionService } from '../services/applicationActionService'
import type { LicenseType, RequiredDocument } from '../types'

interface DocumentUpload {
  requiredDocumentId: number
  file: File | null
  documentName: string
  isMandatory: boolean
}

function ApplyLicense() {
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([])
  const [documentUploads, setDocumentUploads] = useState<DocumentUpload[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<'create' | 'documents' | 'payment'>('create')
  const [applicantRemarks, setApplicantRemarks] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  
  // Get license type from navigation state
  const licenseType = location.state?.licenseType as LicenseType
  
  useEffect(() => {
    if (!licenseType) {
      navigate('/departments')
      return
    }
    
    fetchRequiredDocuments()
  }, [licenseType])

  const fetchRequiredDocuments = async () => {
    try {
      const documents = await requiredDocumentService.getByLicenseType(licenseType.licenseTypeId)
      setRequiredDocuments(documents)
      
      // Initialize document uploads
      const uploads: DocumentUpload[] = documents.map(doc => ({
        requiredDocumentId: doc.requiredDocumentId,
        file: null,
        documentName: doc.documentName,
        isMandatory: doc.isMandatory
      }))
      setDocumentUploads(uploads)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load required documents')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (requiredDocumentId: number, file: File | null) => {
    setDocumentUploads(prev => 
      prev.map(upload => 
        upload.requiredDocumentId === requiredDocumentId 
          ? { ...upload, file }
          : upload
      )
    )
  }

  const validateForm = (): boolean => {
    // Check if all mandatory documents are uploaded
    const missingMandatory = documentUploads.filter(upload => 
      upload.isMandatory && !upload.file
    )
    
    if (missingMandatory.length > 0) {
      setError(`Please upload all mandatory documents: ${missingMandatory.map(d => d.documentName).join(', ')}`)
      return false
    }
    
    return true
  }

  const handleCreateApplication = async () => {
    setSubmitting(true)
    setError('')
    
    try {
      const applicationData = await applicationActionService.create({
        LicenseTypeId: licenseType.licenseTypeId,
        ApplicantRemarks: applicantRemarks
      })
      
      // Redirect to document upload page
      navigate(`/documents/${applicationData.applicationId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create application')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDocumentUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    // TODO: Upload documents to backend
    console.log('Uploading documents:', documentUploads)
    
    // For now, proceed to payment
    setStep('payment')
  }

  const handlePayment = () => {
    // Navigate to payment page with license type data
    navigate('/payment', { state: { licenseType } })
  }

  if (!licenseType) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">No license type selected</Alert>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">Loading required documents...</div>
      </Container>
    )
  }

  return (
    <Container className="mt-4">


      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h4>Apply for {licenseType.licenseName}</h4>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <div className="mb-4">
                <h6>License Information</h6>
                <p><strong>Department:</strong> {licenseType.departmentName}</p>
                <p><strong>Processing Fee:</strong> ₹{licenseType.processingFee}</p>
                {licenseType.description && (
                  <p><strong>Description:</strong> {licenseType.description}</p>
                )}
              </div>

              {step === 'create' && (
                <div>
                  <Form.Group className="mb-3">
                    <Form.Label>Applicant Remarks (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={applicantRemarks}
                      onChange={(e) => setApplicantRemarks(e.target.value)}
                      placeholder="Any additional information or remarks..."
                    />
                  </Form.Group>
                  
                  <Button 
                    variant="primary" 
                    onClick={handleCreateApplication}
                    disabled={submitting}
                  >
                    {submitting ? 'Creating Application...' : 'Create Application'}
                  </Button>
                </div>
              )}
              
              {step === 'documents' && (
                <Form onSubmit={handleDocumentUpload}>
                <h6 className="mb-3">Required Documents</h6>
                
                {requiredDocuments.length === 0 ? (
                  <Alert variant="info">No documents required for this license type.</Alert>
                ) : (
                  requiredDocuments.map((document) => {
                    const upload = documentUploads.find(u => u.requiredDocumentId === document.requiredDocumentId)
                    
                    return (
                      <Card key={document.requiredDocumentId} className="mb-3">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0">
                              {document.documentName}
                              {document.isMandatory && <span className="text-danger"> *</span>}
                            </h6>
                            {document.isMandatory && (
                              <Badge bg="danger" className="ms-2">Required</Badge>
                            )}
                          </div>
                          
                          {document.description && (
                            <p className="text-muted small mb-2">{document.description}</p>
                          )}
                          
                          <Form.Group>
                            <Form.Control
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              onChange={(e) => {
                                const file = (e.target as HTMLInputElement).files?.[0] || null
                                handleFileChange(document.requiredDocumentId, file)
                              }}
                              required={document.isMandatory}
                            />
                            <Form.Text className="text-muted">
                              Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB)
                            </Form.Text>
                          </Form.Group>
                          
                          {upload?.file && (
                            <div className="mt-2">
                              <small className="text-success">
                                ✓ Selected: {upload.file.name} ({(upload.file.size / 1024 / 1024).toFixed(2)} MB)
                              </small>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    )
                  })
                )}

                  <div className="d-flex gap-2 mt-4">
                    <Button 
                      variant="secondary" 
                      onClick={() => setStep('create')}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={submitting}
                    >
                      {submitting ? 'Uploading...' : 'Upload Documents & Continue'}
                    </Button>
                  </div>
                </Form>
              )}
              
              {step === 'payment' && (
                <div>
                  <Alert variant="success">
                    Documents uploaded successfully! Please proceed to payment to complete your application.
                  </Alert>
                  
                  <div className="d-flex gap-2 mt-4">
                    <Button 
                      variant="secondary" 
                      onClick={() => setStep('documents')}
                    >
                      Back to Documents
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={handlePayment}
                    >
                      Proceed to Payment
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h6>Application Summary</h6>
            </Card.Header>
            <Card.Body>
              <p><strong>License:</strong> {licenseType.licenseName}</p>
              <p><strong>Department:</strong> {licenseType.departmentName}</p>
              <p><strong>Processing Fee:</strong> ₹{licenseType.processingFee}</p>
              <hr />
              <p><strong>Required Documents:</strong> {requiredDocuments.length}</p>
              <p><strong>Mandatory:</strong> {requiredDocuments.filter(d => d.isMandatory).length}</p>
              <p><strong>Optional:</strong> {requiredDocuments.filter(d => !d.isMandatory).length}</p>
              <hr />
              <small className="text-muted">
                Please ensure all mandatory documents are uploaded before submitting your application.
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Department-specific Images with Animation */}
      <Row className="mt-3 mb-4 align-items-center">
        <Col xs={8} className="text-center">
          <img 
            src={licenseType.departmentName?.toLowerCase().includes('transport') ? '/images/veh.png' :
                 licenseType.departmentName?.toLowerCase().includes('health') ? '/images/doct.png' :
                 licenseType.departmentName?.toLowerCase().includes('education') ? '/images/medcet.png' :
                 '/images/veh.png'}
            alt={`${licenseType.departmentName} Services`}
            className="img-fluid"
            style={{ maxHeight: '300px', animation: 'slideRight 2s ease-in-out' }}
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x300/007bff/ffffff?text=' + encodeURIComponent(licenseType.departmentName + ' Services')
            }}
          />
        </Col>
        <Col xs={4} className="text-center">
          <img 
            src={licenseType.departmentName?.toLowerCase().includes('transport') ? '/images/Lisence.png' :
                 licenseType.departmentName?.toLowerCase().includes('health') ? '/images/medcet.png' :
                 '/images/Lisence.png'}
            alt={`${licenseType.departmentName} License`}
            className="img-fluid"
            style={{ maxHeight: '150px', animation: 'slideLeft 2s ease-in-out' }}
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/200x150/28a745/ffffff?text=' + encodeURIComponent(licenseType.departmentName + ' License')
            }}
          />
        </Col>
      </Row>
      
      <style>{`
        @keyframes slideRight {
          0% { transform: translateX(-100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideLeft {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </Container>
  )
}

export default ApplyLicense