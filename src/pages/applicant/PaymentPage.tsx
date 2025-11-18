import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Container, Row, Col, Card, Button, Alert, Form } from 'react-bootstrap'
import { applicationQueryService } from '../../services/applicationQueryService'
import { paymentService } from '../../services/paymentService'
import { showSuccess, showError } from '../../app/store/slices/notificationSlice'
import type { ApplicationDetails, CreatePaymentRequest, PaymentInfo } from '../../types'
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

const PaymentPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [application, setApplication] = useState<ApplicationDetails | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [transactionId, setTransactionId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const qrCodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (applicationId) {
      fetchData()
    }
  }, [applicationId])

  // Load QR Code library and generate QR when payment info loads
  useEffect(() => {
    if (paymentInfo || application) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js'
      script.onload = () => generateQRCode()
      script.onerror = () => generateQRCode() // Show fallback
      document.head.appendChild(script)
    }
  }, [paymentInfo, application])

  const generateQRCode = () => {
    if (!qrCodeRef.current) return
    
    const amount = paymentInfo?.amount || application?.paymentAmount || 300
    const upiID = "vakakiranreddy1@ybl"
    const name = "Kiran Reddy"
    const note = `Payment for ${application?.applicationNumber || 'License Application'}`
    
    const upiLink = `upi://pay?pa=${encodeURIComponent(upiID)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount.toString())}&cu=INR&tn=${encodeURIComponent(note)}`
    
    qrCodeRef.current.innerHTML = ""
    
    if (window.qrcode || window.QRCode) {
      try {
        if (window.qrcode) {
          const qr = window.qrcode(0, 'M')
          qr.addData(upiLink)
          qr.make()
          qrCodeRef.current.innerHTML = qr.createImgTag(3)
        } else {
          new window.QRCode(qrCodeRef.current, {
            text: upiLink,
            width: 120,
            height: 120,
            colorDark: "#000000",
            colorLight: "#ffffff"
          })
        }
      } catch {
        generateManualQR(upiLink)
      }
    } else {
      generateManualQR(upiLink)
    }
  }

  const generateManualQR = (text: string) => {
    if (!qrCodeRef.current) return
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(text)}`
    qrCodeRef.current.innerHTML = `<img src="${qrUrl}" alt="QR Code" style="width: 120px; height: 120px; border: 1px solid #ddd;" />`
  }



  const fetchData = async () => {
    try {
      const data = await applicationQueryService.getApplicationPaymentDetails(Number(applicationId))
      setApplication(data.applicationDetails)
      setPaymentInfo(data.paymentInfo)
    } catch (error) {
      console.error('Error fetching data:', error)
      dispatch(showError('Error loading payment details'))
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async () => {
    if (!transactionId.trim()) {
      dispatch(showError('Please enter transaction ID'))
      return
    }

    setSubmitting(true)
    try {
      const paymentData: CreatePaymentRequest = {
        ApplicationId: Number(applicationId),
        Amount: currentPaymentInfo.amount,
        TransactionId: transactionId,
        Remarks: 'Payment completed via online portal'
      }

      await paymentService.create(paymentData)
      
      dispatch(showSuccess('Payment submitted successfully! Your application has been submitted for review.'))
      navigate('/my-applications')
    } catch (error) {
      console.error('Error submitting payment:', error)
      dispatch(showError('Error submitting payment. Please try again.'))
    } finally {
      setSubmitting(false)
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
  
  // Create payment info from API response if not available
  const currentPaymentInfo = paymentInfo || {
    applicationId: application.applicationId,
    amount: application.paymentAmount || 300, // Default amount
    paymentInstructions: 'Please complete the payment and enter the transaction ID below.'
  }

  return (
    <Container className="mt-3">
      <Row>
        <Col lg={6}>
          <Card>
            <Card.Header className="bg-success text-white">
              <h4 className="mb-1">Complete Payment</h4>
              <div>
                <strong>{application.applicationNumber}</strong>
                <br />
                <small>{application.licenseTypeName}</small>
              </div>
            </Card.Header>
            
            <Card.Body>
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
                        Amount: ₹{currentPaymentInfo.amount}
                      </h5>
                      <small className="text-muted">
                        Scan with any UPI app (GPay, PhonePe, Paytm, etc.)
                      </small>
                      
                      {currentPaymentInfo.paymentInstructions && (
                        <>
                          <hr className="my-2" />
                          <Alert variant="warning" className="mb-0 py-2">
                            <small><strong>Instructions:</strong> {currentPaymentInfo.paymentInstructions}</small>
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
                  onClick={handlePaymentSubmit}
                  disabled={!transactionId.trim() || submitting}
                >
                  {submitting ? 'Processing...' : 
                   !transactionId.trim() ? 'Enter Transaction ID to Continue' : 
                   'Submit Payment & Application'}
                </Button>
                
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate(`/documents/${applicationId}`)}
                  disabled={submitting}
                >
                  Back to Documents
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
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
      </Row>
    </Container>
  )
}

export default PaymentPage