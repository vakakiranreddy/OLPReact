import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Container, Row, Col, Card, Button, Alert, Form } from 'react-bootstrap'
import { applicationQueryService } from '../../services/applicationQueryService'
import { requiredDocumentService } from '../../services/requiredDocumentService'
import { showSuccess, showError } from '../../app/store/slices/notificationSlice'
import type { AppDispatch } from '../../app/store'

// QR Code library
interface QRCodeOptions {
  text: string;
  width: number;
  height: number;
  colorDark: string;
  colorLight: string;
}

interface QRCodeGenerator {
  addData(data: string): void;
  make(): void;
  createImgTag(cellSize: number): string;
}

declare global {
  interface Window {
    QRCode: new (element: HTMLElement, options: QRCodeOptions) => void;
    qrcode: (typeNumber: number, errorCorrectionLevel: string) => QRCodeGenerator;
  }
}

import { paymentService } from '../../services/paymentService'
import { documentService } from '../../services/documentService'
import type { ApplicationDetails, CreatePaymentRequest, PaymentInfo, RequiredDocument, DocumentResponse } from '../../types'

type UploadedDocument = DocumentResponse

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const ApplicationProcess: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [application, setApplication] = useState<ApplicationDetails | null>(null)
  const [requiredDocs, setRequiredDocs] = useState<RequiredDocument[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<{[key: number]: UploadedDocument}>({})
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [transactionId, setTransactionId] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [step, setStep] = useState<'documents' | 'payment'>('documents')
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasNavigatedToPayment, setHasNavigatedToPayment] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<DocumentResponse | null>(null)
  const qrCodeRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    console.log('ApplicationProcess useEffect running:', { applicationId, isInitialized })
    if (applicationId && !isInitialized) {
      console.log('Calling fetchApplicationData')
      // Reset all state before fetching
      setApplication(null)
      setRequiredDocs([])
      setUploadedDocs({})
      setPaymentInfo(null)
      setTransactionId('')
      setPreviewDoc(null)
      setStep('documents')
      setIsInitialized(true)
      fetchApplicationData()
    }
  }, [applicationId, isInitialized])

  // Reload documents when returning to documents step (not on initial load)
  useEffect(() => {
    if (step === 'documents' && applicationId && isInitialized && hasNavigatedToPayment) {
      const reloadDocuments = async () => {
        try {
          console.log('Reloading documents after returning from payment')
          const uploadedDocuments = await documentService.getApplicationDocuments(Number(applicationId))
          const uploadedMap: {[key: number]: UploadedDocument} = {}
          
          // Map uploaded documents by matching documentName with required documents
          uploadedDocuments.forEach(uploadedDoc => {
            const matchingRequiredDoc = requiredDocs.find(reqDoc => reqDoc.documentName === uploadedDoc.documentName)
            if (matchingRequiredDoc) {
              const docWithSize = {
                ...uploadedDoc,
                requiredDocumentId: matchingRequiredDoc.requiredDocumentId, // Add the missing requiredDocumentId
                fileSizeFormatted: uploadedDoc.fileSizeFormatted || formatFileSize(uploadedDoc.fileSize || 0)
              }
              uploadedMap[matchingRequiredDoc.requiredDocumentId] = docWithSize
            }
          })
          setUploadedDocs(uploadedMap)
        } catch (error) {
          console.error('Error reloading documents:', error)
        }
      }
      reloadDocuments()
    }
  }, [step, applicationId, isInitialized, hasNavigatedToPayment])



  // Load QR Code library and generate QR when payment step loads
  useEffect(() => {
    if (step === 'payment' && paymentInfo) {
      console.log('Loading QR Code library...')
      
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="qrcode"]')
      if (existingScript) {
        console.log('QR script already loaded')
        setTimeout(generateQRCode, 100)
        return
      }
      
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js'
      script.onload = () => {
        console.log('QR Code library loaded')
        setTimeout(generateQRCode, 100)
      }
      script.onerror = () => {
        console.error('Failed to load QR Code library')
        generateQRCode() // Show fallback
      }
      document.head.appendChild(script)
    }
  }, [step, paymentInfo])

  const generateQRCode = () => {
    if (!qrCodeRef.current) {
      console.log('QR ref not available')
      return
    }
    
    if (!paymentInfo) {
      console.log('Payment info not available')
      return
    }
    
    const amount = paymentInfo.amount || 500
    const upiID = "vakakiranreddy1@ybl"
    const name = "Kiran Reddy"
    const note = `Payment for ${application?.applicationNumber || 'License Application'}`
    
    const upiLink = `upi://pay?pa=${encodeURIComponent(upiID)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount.toString())}&cu=INR&tn=${encodeURIComponent(note)}`
    
    console.log('Generating QR for:', { amount, upiLink })
    
    // Clear old QR
    qrCodeRef.current.innerHTML = ""
    
    if (window.qrcode || window.QRCode) {
      try {
        // Try with qrcode-generator library
        if (window.qrcode) {
          const qr = window.qrcode(0, 'M')
          qr.addData(upiLink)
          qr.make()
          qrCodeRef.current.innerHTML = qr.createImgTag(3)
          console.log('QR Code generated with qrcode-generator')
        } else {
          // Fallback to original QRCode library
          new window.QRCode(qrCodeRef.current, {
            text: upiLink,
            width: 120,
            height: 120,
            colorDark: "#000000",
            colorLight: "#ffffff"
          })
          console.log('QR Code generated with QRCode library')
        }
      } catch (error) {
        console.error('Error generating QR code:', error)
        // Show manual canvas QR
        generateManualQR(upiLink)
      }
    } else {
      // Fallback if QRCode library not loaded
      qrCodeRef.current.innerHTML = `
        <div style="border: 2px solid #ccc; padding: 20px; text-align: center; background: #f8f9fa;">
          <p><strong>QR Code Loading...</strong></p>
          <p>Amount: ₹${amount}</p>
          <p>UPI ID: ${upiID}</p>
          <small>Please try refreshing if QR doesn't appear</small>
        </div>
      `
      console.log('QRCode library not loaded, showing fallback')
    }
  }

  const generateManualQR = (text: string) => {
    if (!qrCodeRef.current) return
    
    // Use Google Charts API as fallback
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(text)}`
    qrCodeRef.current.innerHTML = `
      <img src="${qrUrl}" alt="QR Code" style="width: 120px; height: 120px; border: 1px solid #ddd;" />
    `
    console.log('Generated QR using API fallback')
  }

  const fetchApplicationData = async () => {
    setLoading(true) // Always set loading to true at start
    try {
      // Use the common method that combines all 3 API calls
      const completeDetails = await applicationQueryService.getCompleteDetails(Number(applicationId))
      
      // Set application details directly from response
      setApplication(completeDetails.applicationDetails)
      
      // Map required documents to the expected format
      const docs = completeDetails.requiredDocuments.map(doc => ({
        requiredDocumentId: doc.requiredDocumentId,
        licenseTypeId: completeDetails.applicationDetails.licenseTypeId,
        documentName: doc.documentName,
        description: doc.description,
        isMandatory: doc.isMandatory
      }))
      setRequiredDocs(docs)
      
      // Use uploaded documents from the complete details response
      const uploadedMap: {[key: number]: UploadedDocument} = {}
      completeDetails.applicationDocuments.forEach(uploadedDoc => {
        // Only map documents that have a valid requiredDocumentId (> 0)
        if (uploadedDoc.requiredDocumentId > 0) {
          const docWithSize = {
            ...uploadedDoc,
            applicationId: completeDetails.applicationDetails.applicationId,
            uploadedAt: uploadedDoc.uploadedDate,
            fileSizeFormatted: formatFileSize(uploadedDoc.fileSize || 0)
          }
          uploadedMap[uploadedDoc.requiredDocumentId] = docWithSize
        }
      })
      setUploadedDocs(uploadedMap)
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching application data:', error)
      setLoading(false)
    }
  }



  const handleFileUpload = async (docId: number, file: File) => {
    setUploading(true)
    try {
      const uploadResult = await documentService.uploadDocument(Number(applicationId), docId, file)
      
      // Ensure fileSizeFormatted is present
      const uploadResultWithSize = {
        ...uploadResult,
        fileSizeFormatted: uploadResult.fileSizeFormatted || formatFileSize(uploadResult.fileSize || 0)
      }
      
      // Update uploaded docs state
      setUploadedDocs(prev => ({
        ...prev,
        [docId]: uploadResultWithSize
      }))
      
      dispatch(showSuccess('Document uploaded successfully!'))
    } catch (error) {
      console.error('Error uploading file:', error)
      dispatch(showError('Error uploading file. Please try again.'))
    } finally {
      setUploading(false)
    }
  }
  
  const handleNext = async () => {
    try {
      const payInfo = await paymentService.getPaymentInfo(Number(applicationId))
      setPaymentInfo(payInfo)
      setStep('payment')
      setHasNavigatedToPayment(true) // Mark that user has navigated to payment
    } catch (error) {
      console.error('Error getting payment info:', error)
      dispatch(showError('Error getting payment information. Please try again.'))
    }
  }
  
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
      dispatch(showError('Error loading document preview'))
    }
  }

  const handleRemoveDocument = async (requiredDocumentId: number, documentId: number) => {
    try {
      if (!documentId) {
        dispatch(showError('Invalid document ID'))
        return
      }
      await documentService.deleteDocument(documentId)
      setUploadedDocs(prev => {
        const newDocs = {...prev}
        delete newDocs[requiredDocumentId]
        return newDocs
      })
      setPreviewDoc(null)
      dispatch(showSuccess('Document removed successfully!'))
    } catch (error) {
      console.error('Error removing document:', error)
      dispatch(showError('Error removing document. Please try again.'))
    }
  }

  const handlePaymentSubmit = async () => {
    if (!transactionId.trim()) {
      dispatch(showError('Please enter transaction ID'))
      return
    }

    if (!paymentInfo?.amount) {
      dispatch(showError('Payment amount not available. Please try again.'))
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
      dispatch(showSuccess('Payment submitted successfully! Your application has been submitted for review.'))
      navigate('/my-applications')
    } catch (error) {
      console.error('Error submitting payment:', error)
      // Check if it's just a timeout but payment might have succeeded
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNABORTED') {
        dispatch(showSuccess('Payment is being processed. Please check your applications list to verify submission.'))
        navigate('/my-applications')
      } else {
        dispatch(showError('Error submitting payment. Please try again.'))
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

  return (
    <Container className="mt-4">
      <Row>
        <Col lg={6}>
          <Card>
            <Card.Header className={step === 'payment' ? 'bg-success text-white' : 'bg-primary text-white p-2'}>
              {step === 'payment' ? (
                <>
                  <h4 className="mb-1">Complete Payment</h4>
                  <div>
                    <strong>{application.applicationNumber}</strong>
                    <br />
                    <small>{application.licenseTypeName}</small>
                  </div>
                </>
              ) : (
                <div>
                  <strong>{application.applicationNumber}</strong>
                  <br />
                  <small>{application.licenseTypeName}</small>
                  <br />
                  <small>PDF, JPG, PNG, DOC, DOCX (Max 10MB)</small>
                </div>
              )}
            </Card.Header>
            
            <Card.Body className={step === 'documents' ? 'p-3' : ''}>
              {step === 'documents' && (
                <form onSubmit={(e) => e.preventDefault()}>
                  <h6 className="mb-2">Required Documents</h6>
                  

                  {requiredDocs.map((doc) => (
                    <Card key={doc.requiredDocumentId} className="mb-2">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <div>
                            <h6 className="mb-0">{doc.documentName}</h6>
                            {doc.description && (
                              <small className="text-muted">{doc.description}</small>
                            )}
                          </div>
                        </div>
                        
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
                            required={doc.isMandatory}
                            disabled={uploading}
                            size="sm"
                          />

                          {uploadedDocs[doc.requiredDocumentId] ? (
                            <Alert variant="success" className="mt-1 mb-0 py-2">
                              <small>
                                ✓ {uploadedDocs[doc.requiredDocumentId].fileName} ({uploadedDocs[doc.requiredDocumentId].fileSizeFormatted || 'Unknown size'})
                                <div className="d-flex gap-2 mt-1">
                                  <Button 
                                    variant="outline-info" 
                                    size="sm"
                                    onClick={() => handleViewDocument(uploadedDocs[doc.requiredDocumentId])}
                                    disabled={!uploadedDocs[doc.requiredDocumentId].documentId}
                                  >
                                    View
                                  </Button>
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="p-0 text-danger"
                                    onClick={() => handleRemoveDocument(doc.requiredDocumentId, uploadedDocs[doc.requiredDocumentId]?.documentId)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </small>
                              {previewDoc?.documentId === uploadedDocs[doc.requiredDocumentId].documentId && previewDoc && (
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
                          ) : (
                            <div className="mt-1">
                              <small className="text-muted">No file uploaded</small>
                            </div>
                          )}
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  ))}
                  
                  <div className="text-center mt-3">
                    <Button 
                      variant="primary" 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        handleNext()
                      }}
                      disabled={uploading || !isFormValid()}
                    >
                      {!isFormValid() ? 'Upload Required Documents' : 'Next - Proceed to Payment'}
                    </Button>
                    {!isFormValid() && (
                      <div className="text-danger mt-1">
                        <small>Please upload all required documents to continue</small>
                      </div>
                    )}
                  </div>
                </form>
              )}

              {step === 'payment' && (
                <form onSubmit={(e) => e.preventDefault()}>
                  <h6 className="mb-2">Payment Summary</h6>
                  <Card className="mb-3">
                    <Card.Body>
                      <Row className="align-items-center">
                        <Col md={8}>
                          <div className="mb-2">
                            <small><strong>App:</strong> {application.applicationNumber}</small><br/>
                            <small><strong>Type:</strong> {application.licenseTypeName}</small>
                          </div>
                          <h5 className="text-success mb-2">
                            Amount: ₹{paymentInfo?.amount || 500}
                          </h5>
                          <small className="text-muted">
                            Scan with any UPI app (GPay, PhonePe, Paytm, etc.)
                          </small>
                          
                          {paymentInfo?.paymentInstructions && (
                            <>
                              <hr className="my-2" />
                              <Alert variant="warning" className="mb-0 py-2">
                                <small><strong>Instructions:</strong> {paymentInfo.paymentInstructions}</small>
                              </Alert>
                            </>
                          )}
                        </Col>
                        <Col md={4} className="text-center">
                          <div ref={qrCodeRef} className="d-flex justify-content-center"></div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  <Form.Group className="mb-3">
                    <Form.Label className="mb-1"><strong>Transaction ID *</strong></Form.Label>
                    <Form.Control
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter your payment transaction ID"
                      required
                    />
                    <Form.Text className="text-muted">
                      <small>Enter transaction ID from payment confirmation</small>
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button
                      variant="success"
                      size="lg"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        handlePaymentSubmit()
                      }}
                      disabled={!transactionId.trim() || uploading}
                    >
                      {uploading ? 'Processing...' : 
                       !transactionId.trim() ? 'Enter Transaction ID to Continue' : 
                       'Submit Payment & Application'}
                    </Button>
                    
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        setStep('documents')
                        setPreviewDoc(null) // Clear any preview
                      }}
                      disabled={uploading}
                    >
                      Back to Documents
                    </Button>
                  </div>
                </form>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        {step === 'documents' && (
          <Col lg={6}>
            <Card className="h-100">
              <Card.Header className="bg-success text-white p-3">
                <h5 className="mb-0">📋 Application Process</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '30px', height: '30px', fontSize: '14px'}}>1</div>
                    <span>Upload all required documents</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '30px', height: '30px', fontSize: '14px'}}>2</div>
                    <span>Pay the processing fee</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '30px', height: '30px', fontSize: '14px'}}>3</div>
                    <span>A reviewer will be assigned</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '30px', height: '30px', fontSize: '14px'}}>4</div>
                    <span>You will be notified with every status change</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '30px', height: '30px', fontSize: '14px'}}>5</div>
                    <span>You can track your application status</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '30px', height: '30px', fontSize: '14px'}}>✓</div>
                    <span>Once approved, you will get your license certificate</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '30px', height: '30px', fontSize: '12px'}}>📧</div>
                    <span>You can find it in your page and also get it through mail</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <img 
                    src="/images/DigitalLisence.png" 
                    alt="License" 
                    className="img-fluid"
                    style={{ maxHeight: '350px', objectFit: 'contain' }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
        
        {step === 'payment' && (
          <Col lg={6}>
            <Card className="h-100">
              <Card.Header className="bg-info text-white p-3">
                <h5 className="mb-0">Payment Options</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Pay through UPI:</h6>
                    <small className="text-muted">UPI ID: <strong>vakakiranreddy1@ybl</strong></small>
                  </div>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <img src="/images/Gpay.jpg" alt="Google Pay" style={{height: '80px', objectFit: 'contain'}} />
                    <img src="/images/phonepay.jpg" alt="PhonePe" style={{height: '80px', objectFit: 'contain'}} />
                    <img src="/images/Paytm.png" alt="Paytm" style={{height: '80px', objectFit: 'contain'}} />
                  </div>
                </div>
                
                <div className="mb-4">
                  <h6 className="mb-3">Bank Transfer:</h6>
                  <div className="bg-light p-3 rounded">
                    <div className="row">
                      <div className="col-6">
                        <small><strong>Account Name:</strong></small><br/>
                        <small>Andhra Pradesh Govt</small>
                      </div>
                      <div className="col-6">
                        <small><strong>Account Number:</strong></small><br/>
                        <small>1234567890123456</small>
                      </div>
                    </div>
                    <div className="row mt-2">
                      <div className="col-6">
                        <small><strong>IFSC Code:</strong></small><br/>
                        <small>SBIN0001234</small>
                      </div>
                      <div className="col-6">
                        <small><strong>Bank:</strong></small><br/>
                        <small>State Bank of India</small>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-hidden">
                  <div className="d-flex" style={{animation: 'scroll 10s linear infinite'}}>
                    <img src="/images/L1.png" alt="License 1" style={{height: '120px', objectFit: 'contain', marginRight: '20px'}} />
                    <img src="/images/L2.png" alt="License 2" style={{height: '120px', objectFit: 'contain', marginRight: '20px'}} />
                    <img src="/images/medcet.png" alt="Medical License" style={{height: '120px', objectFit: 'contain', marginRight: '20px'}} />
                    <img src="/images/Lisence.png" alt="License" style={{height: '120px', objectFit: 'contain', marginRight: '20px'}} />
                    <img src="/images/L1.png" alt="License 1" style={{height: '120px', objectFit: 'contain', marginRight: '20px'}} />
                    <img src="/images/L2.png" alt="License 2" style={{height: '120px', objectFit: 'contain', marginRight: '20px'}} />
                  </div>
                  <style>{`
                    @keyframes scroll {
                      0% { transform: translateX(0); }
                      100% { transform: translateX(-50%); }
                    }
                  `}</style>
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  )
}

export default ApplicationProcess