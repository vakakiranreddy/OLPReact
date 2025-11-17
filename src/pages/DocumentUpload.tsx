import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Container, Row, Col, Card, Button, Alert, Form } from 'react-bootstrap'
import { applicationQueryService } from '../services/applicationQueryService'
import { documentService } from '../services/documentService'
import { requiredDocumentService } from '../services/requiredDocumentService'
import { showSuccess, showError } from '../store/slices/notificationSlice'
import type { ApplicationDetails, RequiredDocument, DocumentResponse } from '../types'
import type { AppDispatch } from '../store'

const DocumentUpload: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [application, setApplication] = useState<ApplicationDetails | null>(null)
  const [requiredDocs, setRequiredDocs] = useState<RequiredDocument[]>([])
  const [uploadedDocs, setUploadedDocs] = useState<{[key: number]: DocumentResponse}>({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<DocumentResponse | null>(null)


  useEffect(() => {
    if (applicationId) {
      fetchData()
    }
  }, [applicationId])

  const fetchData = async () => {
    try {
      const appData = await applicationQueryService.getApplicationDetails(Number(applicationId))
      setApplication(appData)
      
      const docs = await requiredDocumentService.getByLicenseType(appData.licenseTypeId)
      setRequiredDocs(docs)
      
      const uploadedDocuments = await documentService.getApplicationDocumentsWithRequiredId(Number(applicationId))
      const uploadedMap: {[key: number]: DocumentResponse} = {}
      uploadedDocuments.forEach(doc => {
        if (!uploadedMap[doc.requiredDocumentId] || 
            new Date(doc.uploadedDate) > new Date(uploadedMap[doc.requiredDocumentId].uploadedDate)) {
          uploadedMap[doc.requiredDocumentId] = doc
        }
      })
      setUploadedDocs(uploadedMap)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (docId: number, file: File) => {
    setUploading(true)
    try {
      const uploadResult = await documentService.uploadDocument(Number(applicationId), docId, file)
      
      setUploadedDocs(prev => ({
        ...prev,
        [docId]: uploadResult
      }))
      
      const fileInput = document.getElementById(`file-${docId}`) as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
      dispatch(showSuccess('Document uploaded successfully!'))
    } catch (error) {
      console.error('Error uploading file:', error)
      dispatch(showError('Error uploading file. Please try again.'))
    } finally {
      setUploading(false)
    }
  }

  const isFormValid = () => {
    const mandatoryDocs = requiredDocs.filter(doc => doc.isMandatory)
    return mandatoryDocs.every(doc => uploadedDocs[doc.requiredDocumentId])
  }

  const handleNext = () => {
    navigate(`/payment/${applicationId}`)
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
    <Container className="mt-3">
      <Row>
        <Col lg={6}>
          <Card>
            <Card.Header className="bg-primary text-white p-2">
              <div>
                <strong>{application.applicationNumber}</strong>
                <br />
                <small>{application.licenseTypeName}</small>
                <br />
                <small>PDF, JPG, PNG, DOC, DOCX (Max 10MB)</small>
              </div>
            </Card.Header>
            
            <Card.Body className="p-3">
              <h6 className="mb-2">Required Documents</h6>
              
              {requiredDocs.map((doc) => (
                <Card key={doc.requiredDocumentId} className="mb-2">
                  <Card.Body className="p-2">
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

                        disabled={uploading}
                        size="sm"
                      />

                      {uploadedDocs[doc.requiredDocumentId] ? (
                        <Alert variant="success" className="mt-1 mb-0 py-2">
                          <small>
                            ✓ {uploadedDocs[doc.requiredDocumentId].fileName} ({uploadedDocs[doc.requiredDocumentId].fileSizeFormatted})
                            <div className="d-flex gap-2 mt-1">
                              <Button 
                                variant="outline-info" 
                                size="sm"
                                onClick={() => handleViewDocument(uploadedDocs[doc.requiredDocumentId])}
                              >
                                View
                              </Button>
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 text-danger"
                                onClick={() => {
                                  setUploadedDocs(prev => {
                                    const newDocs = {...prev}
                                    delete newDocs[doc.requiredDocumentId]
                                    return newDocs
                                  })
                                }}
                              >
                                Remove
                              </Button>
                            </div>
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
                  onClick={handleNext}
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
            </Card.Body>
          </Card>
        </Col>
        
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
      </Row>
    </Container>
  )
}

export default DocumentUpload