import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Alert, Form } from 'react-bootstrap'
import { applicationQueryService } from '../services/applicationQueryService'
import { paymentService } from '../services/paymentService'
import type { ApplicationDetails, CreatePaymentRequest, PaymentInfo } from '../types'

const PaymentPage: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  const [application, setApplication] = useState<ApplicationDetails | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [transactionId, setTransactionId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (applicationId) {
      fetchData()
    }
  }, [applicationId])

  const fetchData = async () => {
    try {
      const appData = await applicationQueryService.getApplicationDetails(Number(applicationId))
      setApplication(appData)
      
      const payInfo = await paymentService.getPaymentInfo(Number(applicationId))
      setPaymentInfo(payInfo)
    } catch (error) {
      console.error('Error fetching data:', error)
      // If payment info fails, create from application data
      if (application) {
        setPaymentInfo({
          applicationId: application.applicationId,
          amount: application.paymentAmount || 0,
          paymentInstructions: 'Please complete the payment using your preferred method and enter the transaction ID below.'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async () => {
    if (!transactionId.trim()) {
      alert('Please enter transaction ID')
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
      
      alert('Payment submitted successfully! Your application has been submitted for review.')
      navigate('/my-applications')
    } catch (error) {
      console.error('Error submitting payment:', error)
      alert('Error submitting payment. Please try again.')
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
    <Container className="mt-4">
      <Row>
        <Col lg={6} className="mx-auto">
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
              <Alert variant="success" className="mb-4">
                <strong>Documents Uploaded Successfully!</strong>
                <br />
                All required documents have been uploaded. Please complete the payment to submit your application.
              </Alert>

              <h5 className="mb-3">Payment Summary</h5>
              <Card className="mb-4">
                <Card.Body>
                  <Row className="mb-3">
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
                      <h4 className="text-success mb-0">
                        Total Amount: ₹{currentPaymentInfo.amount}
                      </h4>
                    </Col>
                  </Row>
                  
                  {currentPaymentInfo.paymentInstructions && (
                    <>
                      <hr />
                      <Alert variant="warning" className="mb-0">
                        <strong>Payment Instructions:</strong>
                        <br />
                        {currentPaymentInfo.paymentInstructions}
                      </Alert>
                    </>
                  )}
                </Card.Body>
              </Card>

              <Form.Group className="mb-4">
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
      </Row>
    </Container>
  )
}

export default PaymentPage