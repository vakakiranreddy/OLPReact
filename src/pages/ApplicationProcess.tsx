import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Alert, ProgressBar, Badge, Form } from 'react-bootstrap'
import { applicationQueryService } from '../services/applicationQueryService'

import { paymentService } from '../services/paymentService'
import { documentService } from '../services/documentService'
import { requiredDocumentService } from '../services/requiredDocumentService'
import type { ApplicationDetails, CreatePaymentRequest, PaymentInfo, RequiredDocument, DocumentResponse } from '../types'

type UploadedDocument = DocumentResponse

const ApplicationProcess: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  const [application, setApplication] = useState<ApplicationDetails | null>(null)
  const [requiredDocs, setRequiredDocs] = useState<RequiredDocument[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<{[key: number]: UploadedDocument}>({})
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [transactionId, setTransactionId] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [step, setStep] = useState<'documents' | 'payment'>('documents')
  const [isInitialized, setIsInitialized] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<DocumentResponse | null>(null)


  useEffect(() => {
    if (applicationId && !isInitialized) {
      setIsInitialized(true)
      fetchApplicationData()
    }
  }, [applicationId, isInitialized])

  // Load uploaded documents after main data loads
  useEffect(() => {
    if (application && requiredDocs.length > 0 && step === 'documents') {
      console.log('Initial document load...')
      loadUploadedDocuments()
    }
  }, [application, requiredDocs, step])

  // Reload documents when returning to documents step
  useEffect(() => {
    if (step === 'documents' && application && requiredDocs.length > 0) {
      console.log('Step changed to documents, reloading documents...')
      loadUploadedDocuments()
    }
  }, [step, application, requiredDocs])




  const fetchApplicationData = async () => {
    try {
      // Just get application details first
      const appData = await applicationQueryService.getApplicationDetails(Number(applicationId))
      setApplication(appData)
      
      // Get required documents by license type
      const docs = await requiredDocumentService.getByLicenseType(appData.licenseTypeId)
      setRequiredDocs(docs)
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching application data:', error)
      setLoading(false)
    }
  }

  // Load uploaded documents separately after component loads
  const loadUploadedDocuments = async () => {
    try {
      console.log('Loading uploaded documents for application:', applicationId)
      const uploadedDocuments = await documentService.getApplicationDocumentsWithRequiredId(Number(applicationId))
      console.log('Fetched uploaded documents:', uploadedDocuments)
      
      const uploadedMap: {[key: number]: UploadedDocument} = {}
      
      uploadedDocuments.forEach(doc => {
        if (!uploadedMap[doc.requiredDocumentId] || 
            new Date(doc.uploadedDate) > new Date(uploadedMap[doc.requiredDocumentId].uploadedDate)) {
          uploadedMap[doc.requiredDocumentId] = doc
        }
      })
      
      console.log('Mapped uploaded documents:', uploadedMap)
      setUploadedDocs(uploadedMap)
    } catch (error) {
      console.error('Error loading uploaded documents:', error)
    }
  }

  const handleFileUpload = async (docId: number, file: File) => {
    setUploading(true)
    try {
      const uploadResult = await documentService.uploadDocument(Number(applicationId), docId, file)
      
      // Update uploaded docs state
      setUploadedDocs(prev => ({
        ...prev,
        [docId]: uploadResult
      }))
      
      alert('Document uploaded successfully!')
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file. Please try again.')
    } finally {
      setUploading(false)
    }
  }
  
  const handleNext = async () => {
    try {
      const payInfo = await paymentService.getPaymentInfo(Number(applicationId))
      setPaymentInfo(payInfo)
      setStep('payment')
    } catch (error) {
      console.error('Error getting payment info:', error)
      alert('Error getting payment information. Please try again.')
    }
  }
  
  // Check if all mandatory documents are uploaded
  const isFormValid = () => {
    const mandatoryDocs = requiredDocs.filter(doc => doc.isMandatory)
    return mandatoryDocs.every(doc => uploadedDocs[doc.requiredDocumentId])
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

  const handlePaymentSubmit = async () => {
    if (!transactionId.trim()) {
      alert('Please enter transaction ID')
      return
    }

    if (!paymentInfo?.amount) {
      alert('Payment amount not available. Please try again.')
      return
    }

    setUploading(true) // Show loading state
    try {
      const paymentData: CreatePaymentRequest = {
        ApplicationId: Number(applicationId),
        Amount: paymentInfo.amount,
        TransactionId: transactionId,
        Remarks: 'Payment completed via online portal'
      }

      console.log('Sending payment data:', paymentData)
      const result = await paymentService.create(paymentData)
      console.log('Payment created successfully:', result)
      
      // Payment creation automatically submits the application
      alert('Payment submitted successfully! Your application has been submitted for review.')
      navigate('/my-applications')
    } catch (error) {
      console.error('Error submitting payment:', error)
      // Check if it's just a timeout but payment might have succeeded
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNABORTED') {
        alert('Payment is being processed. Please check your applications list to verify submission.')
        navigate('/my-applications')
      } else {
        alert('Error submitting payment. Please try again.')
      }
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">Loading...</div>
      </Container>
    )
  }

  if (!application) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">Application not found.</Alert>
      </Container>
    )
  }

  const progressValue = step === 'documents' ? 50 : 100

  return (
    <Container className="mt-4">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-1">Application Process</h4>
              <div>
                <strong>{application.applicationNumber}</strong>
                <br />
                <small>{application.licenseTypeName}</small>
              </div>
            </Card.Header>
            
            <Card.Body>
              {/* Progress Steps */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">Progress</small>
                  <small className="text-muted">{step === 'documents' ? '50%' : '100%'}</small>
                </div>
                <ProgressBar now={progressValue} className="mb-3" />
                
                <div className="d-flex justify-content-between">
                  <div className="text-center">
                    <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '12px'}}>
                      ✓
                    </div>
                    <div className="small text-success mt-1">Created</div>
                  </div>
                  <div className="text-center">
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                      step === 'documents' ? 'bg-primary text-white' : 'bg-success text-white'
                    }`} style={{width: '30px', height: '30px', fontSize: '12px'}}>
                      {step === 'documents' ? '2' : '✓'}
                    </div>
                    <div className={`small mt-1 ${step === 'documents' ? 'text-primary' : 'text-success'}`}>Documents</div>
                  </div>
                  <div className="text-center">
                    <div className={`rounded-circle d-inline-flex align-items-center justify-center ${
                      step === 'payment' ? 'bg-primary text-white' : 'bg-secondary text-white'
                    }`} style={{width: '30px', height: '30px', fontSize: '12px'}}>
                      3
                    </div>
                    <div className={`small mt-1 ${step === 'payment' ? 'text-primary' : 'text-muted'}`}>Payment</div>
                  </div>
                </div>
              </div>

              {step === 'documents' && (
                <div>
                  <h5 className="mb-3">Upload Required Documents</h5>
                  

                  <div className="mb-3">
                    {requiredDocs.map((doc) => (
                      <Card key={doc.requiredDocumentId} className="mb-3">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="mb-1">{doc.documentName}</h6>
                              {doc.description && (
                                <small className="text-muted">{doc.description}</small>
                              )}
                            </div>
                            {doc.isMandatory && (
                              <Badge bg="danger">Required</Badge>
                            )}
                          </div>
                          

                          {uploadedDocs[doc.requiredDocumentId] ? (
                            <div>
                              <Alert variant="success" className="mb-2">
                                <strong>✓ Document Uploaded</strong>
                                <br />
                                <small>
                                  File: {uploadedDocs[doc.requiredDocumentId].fileName}
                                  <br />
                                  Date: {new Date(uploadedDocs[doc.requiredDocumentId].uploadedDate).toLocaleDateString()}
                                  <br />
                                  <Button 
                                    variant="outline-info" 
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => handleViewDocument(uploadedDocs[doc.requiredDocumentId])}
                                  >
                                    View Document
                                  </Button>
                                </small>
                                {previewDoc?.documentId === uploadedDocs[doc.requiredDocumentId].documentId && (
                                  <div className="mt-3">
                                    {previewDoc.fileData ? (
                                      <>
                                        {previewDoc.fileType?.startsWith('image/') && (
                                          <img 
                                            src={`data:${previewDoc.fileType};base64,${previewDoc.fileData}`} 
                                            alt={previewDoc.documentName}
                                            className="img-fluid"
                                            style={{ maxHeight: '300px' }}
                                          />
                                        )}
                                        {previewDoc.fileType === 'application/pdf' && (
                                          <iframe
                                            src={`data:application/pdf;base64,${previewDoc.fileData}`}
                                            width="100%"
                                            height="400px"
                                            title={previewDoc.documentName}
                                          />
                                        )}
                                        {!previewDoc.fileType?.startsWith('image/') && previewDoc.fileType !== 'application/pdf' && (
                                          <div className="alert alert-info">Preview not available for this file type</div>
                                        )}
                                      </>
                                    ) : (
                                      <div className="alert alert-warning">Loading preview...</div>
                                    )}
                                    <Button 
                                      variant="outline-secondary" 
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => setPreviewDoc(null)}
                                    >
                                      Hide Preview
                                    </Button>
                                  </div>
                                )}
                              </Alert>
                              <Form.Group>
                                <Form.Label className="small text-muted">Replace document (optional):</Form.Label>
                                <Form.Control
                                  id={`file-${doc.requiredDocumentId}`}
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  onChange={(e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0]
                                    if (file) {
                                      handleFileUpload(doc.requiredDocumentId, file)
                                    }
                                  }}
                                  disabled={uploading}
                                  size="sm"
                                />
                              </Form.Group>
                            </div>
                          ) : (
                            <Form.Group>
                              <Form.Control
                                id={`file-${doc.requiredDocumentId}`}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={(e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0]
                                  if (file) {
                                    handleFileUpload(doc.requiredDocumentId, file)
                                  }
                                }}
                                disabled={uploading}
                                size="sm"
                              />
                              <Form.Text className="text-muted">
                                Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                              </Form.Text>
                            </Form.Group>
                          )}
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="text-center mt-4">
                    <Button 
                      variant="primary" 
                      onClick={handleNext}
                      disabled={uploading || !isFormValid()}
                      className="me-2"
                    >
                      {!isFormValid() ? 'Upload Required Documents' : 'Next - Proceed to Payment'}
                    </Button>
                    

                    
                    {!isFormValid() && (
                      <div className="text-danger mt-2">
                        <small>Please upload all required documents to continue</small>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 'payment' && (
                <div>
                  <Alert variant="success" className="mb-3">
                    <strong>Documents Uploaded Successfully!</strong>
                    <br />
                    All required documents have been uploaded. Please complete the payment to submit your application.
                  </Alert>

                  <h5 className="mb-3">Payment Summary</h5>
                  <Card className="mb-3">
                    <Card.Body>
                      <Row>
                        <Col sm={6}>
                          <strong>Application Number:</strong>
                          <br />
                          {application.applicationNumber}
                        </Col>
                        <Col sm={6}>
                          <strong>License Type:</strong>
                          <br />
                          {application.licenseTypeName}
                        </Col>
                      </Row>
                      <hr />
                      <Row>
                        <Col>
                          <h5 className="text-success mb-0">
                            Total Amount: ₹{paymentInfo?.amount || 500}
                          </h5>
                        </Col>
                      </Row>
                      
                      {paymentInfo?.paymentInstructions && (
                        <>
                          <hr />
                          <Alert variant="warning" className="mb-0">
                            <strong>Payment Instructions:</strong>
                            <br />
                            {paymentInfo.paymentInstructions}
                          </Alert>
                        </>
                      )}
                    </Card.Body>
                  </Card>

                  <Form.Group className="mb-3">
                    <Form.Label><strong>Transaction ID *</strong></Form.Label>
                    <Form.Control
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter your payment transaction ID"
                      required
                    />
                    <Form.Text className="text-muted">
                      Enter the transaction ID from your payment confirmation
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handlePaymentSubmit}
                      disabled={!transactionId.trim() || uploading}
                    >
                      {uploading ? 'Processing Payment...' : 
                       !transactionId.trim() ? 'Enter Transaction ID to Continue' : 'Submit Payment & Application'}
                    </Button>
                    
                    <Button
                      variant="outline-secondary"
                      onClick={async () => {
                        setStep('documents')
                        setPreviewDoc(null) // Clear any preview
                        await loadUploadedDocuments() // Wait for documents to load
                      }}
                    >
                      Back to Documents
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default ApplicationProcess