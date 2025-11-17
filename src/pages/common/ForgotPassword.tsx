import { useState } from 'react'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { authService } from '../../services/authService'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState(1) // 1: Email, 2: OTP & Password
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'Email is required'
    if (!email.endsWith('@gmail.com')) return 'Email must end with @gmail.com'
    return ''
  }

  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one symbol'
    return ''
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    setLoading(true)
    setError('')

    try {
      await authService.sendForgotPasswordOtp(email)
      setStep(2)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp.trim()) {
      setError('Please enter the OTP')
      return
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError('')

    try {
      await authService.forgotPassword(email, otp, newPassword, confirmPassword)
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="login-container">
        <Container>
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <Card>
                <Card.Header className="text-center">
                  <h3>Password Reset Successful</h3>
                </Card.Header>
                <Card.Body className="text-center">
                  <Alert variant="success">
                    Your password has been reset successfully!
                  </Alert>
                  <Link to="/login">
                    <Button variant="primary">Go to Login</Button>
                  </Link>
                </Card.Body>
              </Card>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="login-container">
      <Container>
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <Card>
              <Card.Header className="text-center">
                <h3>{step === 1 ? 'Forgot Password' : 'Reset Password'}</h3>
              </Card.Header>
              <Card.Body>
                {error && (
                  <Alert variant="danger">
                    {error}
                  </Alert>
                )}

                {step === 1 ? (
                  <Form onSubmit={handleSendOtp}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your gmail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <div className="d-grid">
                      <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Sending OTP...' : 'Send Reset OTP'}
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <Form onSubmit={handleResetPassword}>
                    <Form.Group className="mb-3">
                      <Form.Label>Enter OTP</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        required
                      />
                      <Form.Text className="text-muted">
                        Check your email for the 6-digit reset code.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <div className="d-grid">
                      <Button variant="success" type="submit" disabled={loading}>
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                      </Button>
                    </div>
                  </Form>
                )}

                <div className="text-center mt-3">
                  <p>Remember your password? <Link to="/login">Login here</Link></p>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default ForgotPassword