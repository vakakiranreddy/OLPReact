import { useState } from 'react'
import { Form, Button, Alert } from 'react-bootstrap'
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
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      <div 
        className="container-fluid min-vh-100" 
        style={{
          backgroundImage: 'url(/images/Background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="row min-vh-100">
          {/* Government Image Section */}
          <div className="col-12 col-md-6 d-flex align-items-center justify-content-center">
            <div className="text-center px-3 py-4">
              <img 
                src="/images/govtimg.png" 
                alt="Government Logo" 
                className="img-fluid mb-4"
                style={{maxHeight: '420px', objectFit: 'contain'}}
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Hb3Zlcm5tZW50IExvZ288L3RleHQ+PC9zdmc+'
                }}
              />
              <h4 className="text-white mb-3">Online License & Permit System</h4>
              <p className="text-white-50">Secure and efficient government services at your fingertips</p>
            </div>
          </div>
          
          {/* Success Message Section */}
          <div className="col-12 col-md-6 d-flex align-items-center justify-content-center" style={{backgroundColor: 'white'}}>
            <div className="w-100 px-4 py-5" style={{maxWidth: '400px'}}>
              <div className="text-center mb-4">
                <h3 className="text-success mb-2">Password Reset Successful</h3>
                <p className="text-muted">Your password has been updated successfully</p>
              </div>
              
              <Alert variant="success" className="mb-4">
                <i className="fas fa-check-circle me-2"></i>
                Your password has been reset successfully!
              </Alert>
              
              <div className="d-grid">
                <Link to="/login">
                  <Button variant="primary" size="lg" className="w-100">
                    Go to Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="container-fluid min-vh-100" 
      style={{
        backgroundImage: 'url(/images/Background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="row min-vh-100">
        {/* Government Image Section */}
        <div className="col-12 col-md-6 d-flex align-items-center justify-content-center">
          <div className="text-center px-3 py-4">
            <img 
              src="/images/govtimg.png" 
              alt="Government Logo" 
              className="img-fluid mb-4"
              style={{maxHeight: '420px', objectFit: 'contain'}}
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Hb3Zlcm5tZW50IExvZ288L3RleHQ+PC9zdmc+'
              }}
            />
            <h4 className="text-white mb-3">Online License & Permit System</h4>
            <p className="text-white-50">Secure and efficient government services at your fingertips</p>
          </div>
        </div>
        
        {/* Form Section */}
        <div className="col-12 col-md-6 d-flex align-items-center justify-content-center" style={{backgroundColor: 'white'}}>
          <div className="w-100 px-4 py-5" style={{maxWidth: '400px'}}>
            <div className="text-center mb-4">
              <h3 className="text-primary mb-2">{step === 1 ? 'Forgot Password' : 'Reset Password'}</h3>
              <p className="text-muted">
                {step === 1 
                  ? 'Enter your email to receive a reset code' 
                  : 'Enter the code and your new password'
                }
              </p>
            </div>
            
            {error && (
              <Alert variant="danger" className="mb-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
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

                <div className="d-grid mb-3">
                  <Button variant="primary" type="submit" disabled={loading} size="lg">
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending OTP...
                      </>
                    ) : (
                      'Send Reset OTP'
                    )}
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
                  <div className="position-relative">
                    <Form.Control
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
                      style={{ zIndex: 10, paddingRight: '12px' }}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <i className={`bi ${showNewPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                    </button>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
                      style={{ zIndex: 10, paddingRight: '12px' }}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                    </button>
                  </div>
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button variant="success" type="submit" disabled={loading} size="lg">
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </div>
              </Form>
            )}

            <div className="text-center">
              <p className="mb-0">Remember your password? <Link to="/login" className="text-decoration-none">Login here</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword