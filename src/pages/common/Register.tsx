import { useState } from 'react'
import { Form, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { authService } from '../../services/authService'

function Register() {
  // Local form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [address, setAddress] = useState('')
  
  // Error states
  const [firstNameError, setFirstNameError] = useState('')
  const [lastNameError, setLastNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  
  // Touched states
  const [firstNameTouched, setFirstNameTouched] = useState(false)
  const [lastNameTouched, setLastNameTouched] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false)
  
  // Loading and success states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)

  // Validation functions
  const validateFirstName = (name: string, touched: boolean): string => {
    if (touched && !name.trim()) return 'First name is required'
    if (name && name.length > 100) return 'First name must be less than 100 characters'
    return ''
  }

  const validateLastName = (name: string, touched: boolean): string => {
    if (touched && !name.trim()) return 'Last name is required'
    if (name && name.length > 100) return 'Last name must be less than 100 characters'
    return ''
  }

  const validateEmail = (email: string, touched: boolean): string => {
    if (touched && !email.trim()) return 'Email is required'
    if (email && email.includes(' ')) return 'Email cannot contain spaces'
    if (email && !email.endsWith('@gmail.com')) return 'Email must end with @gmail.com'
    return ''
  }

  const validatePhone = (phone: string, touched: boolean): string => {
    if (touched && !phone.trim()) return 'Phone number is required'
    if (phone && phone.includes(' ')) return 'Phone number cannot contain spaces'
    if (phone && phone.length > 15) return 'Phone number must be less than 15 characters'
    if (phone && !/^\d+$/.test(phone)) return 'Phone number must contain only digits'
    return ''
  }

  const validatePassword = (password: string, touched: boolean): string => {
    if (touched && !password) return 'Password is required'
    if (password && password.includes(' ')) return 'Password cannot contain spaces'
    if (password && password.length < 8) return 'Password must be at least 8 characters'
    if (password && !/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
    if (password && !/[0-9]/.test(password)) return 'Password must contain at least one number'
    if (password && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one symbol'
    return ''
  }

  const validateConfirmPassword = (confirmPass: string, touched: boolean): string => {
    if (touched && !confirmPass) return 'Confirm password is required'
    if (confirmPass && confirmPass !== password) return 'Passwords do not match'
    return ''
  }

  const handleSendOtp = async () => {
    const emailErr = validateEmail(email, true)
    setEmailError(emailErr)
    
    if (emailErr) return
    
    setSendingOtp(true)
    setError('')
    
    try {
      await authService.sendOtp(email)
      setOtpSent(true)
      setError('') // Clear any previous errors on success
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
      setOtpSent(false) // Ensure OTP field doesn't show on error
      setOtpVerified(false) // Reset verification status
    } finally {
      setSendingOtp(false)
    }
  }
  
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setOtpError('Please enter the OTP')
      return
    }
    
    setVerifyingOtp(true)
    setOtpError('')
    
    try {
      await authService.verifyOtp(email, otp)
      setOtpVerified(true)
      setOtpError('')
    } catch (err: unknown) {
      setOtpError(err instanceof Error ? err.message : 'Invalid OTP')
    } finally {
      setVerifyingOtp(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otpVerified) {
      setError('Please verify your email first')
      return
    }
    
    // Validate all inputs
    const firstNameErr = validateFirstName(firstName, true)
    const lastNameErr = validateLastName(lastName, true)
    const emailErr = validateEmail(email, true)
    const phoneErr = validatePhone(phoneNumber, true)
    const passwordErr = validatePassword(password, true)
    const confirmPasswordErr = validateConfirmPassword(confirmPassword, true)
    
    setFirstNameError(firstNameErr)
    setLastNameError(lastNameErr)
    setEmailError(emailErr)
    setPhoneError(phoneErr)
    setPasswordError(passwordErr)
    setConfirmPasswordError(confirmPasswordErr)
    
    // Stop if validation fails
    if (firstNameErr || lastNameErr || emailErr || phoneErr || passwordErr || confirmPasswordErr) return
    
    setLoading(true)
    setError('')
    
    try {
      // Call register API
      await authService.register({
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
        confirmPassword,
        address: address || undefined
      })
      
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
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
                // Fallback to a placeholder if image doesn't exist
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Hb3Zlcm5tZW50IExvZ288L3RleHQ+PC9zdmc+'
              }}
            />
            <h4 className="text-white mb-3">Online License & Permit System</h4>
            <p className="text-white-50">Secure and efficient government services at your fingertips</p>
          </div>
        </div>
        
        {/* Register Form Section */}
        <div className="col-12 col-md-6 d-flex align-items-center justify-content-center" style={{backgroundColor: 'white'}}>
        <div className="w-100 px-2 py-2" style={{maxWidth: '550px'}}>
          <div className="text-center mb-4">
            <h3 className="text-primary mb-2">Create Your Account</h3>
            <p className="text-muted">Fill in your details to register</p>
          </div>
          
          {success && (
            <Alert variant="success" className="mb-3">
              <i className="fas fa-check-circle me-2"></i>
              Registration successful! You can now <Link to="/login" className="text-decoration-none">login here</Link>.
            </Alert>
          )}
                {error && (
                  <Alert variant="danger">
                    {error}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter your first name"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value)
                            setFirstNameError(validateFirstName(e.target.value, firstNameTouched))
                          }}
                          onBlur={() => {
                            setFirstNameTouched(true)
                            setFirstNameError(validateFirstName(firstName, true))
                          }}
                          isInvalid={!!firstNameError}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {firstNameError}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </div>
                    
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter your last name"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value)
                            setLastNameError(validateLastName(e.target.value, lastNameTouched))
                          }}
                          onBlur={() => {
                            setLastNameTouched(true)
                            setLastNameError(validateLastName(lastName, true))
                          }}
                          isInvalid={!!lastNameError}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {lastNameError}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </div>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        type="email"
                        placeholder="Enter your gmail"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setEmailError(validateEmail(e.target.value, emailTouched))
                          setOtpSent(false)
                          setOtpVerified(false)
                        }}
                        onBlur={() => {
                          setEmailTouched(true)
                          setEmailError(validateEmail(email, true))
                        }}
                        isInvalid={!!emailError}
                        disabled={otpVerified}
                        required
                      />
                      {!otpVerified && (
                        <Button 
                          variant="outline-primary" 
                          onClick={handleSendOtp}
                          disabled={sendingOtp || !!emailError || !email}
                        >
                          {sendingOtp ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                        </Button>
                      )}
                      {otpVerified && (
                        <Button variant="success" disabled>
                          ✓ Verified
                        </Button>
                      )}
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {emailError}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  {otpSent && !otpVerified && (
                    <Form.Group className="mb-3">
                      <Form.Label>Enter OTP</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => {
                            setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                            setOtpError('')
                          }}
                          isInvalid={!!otpError}
                          maxLength={6}
                        />
                        <Button 
                          variant="primary" 
                          onClick={handleVerifyOtp}
                          disabled={verifyingOtp || otp.length !== 6}
                        >
                          {verifyingOtp ? 'Verifying...' : 'Verify'}
                        </Button>
                      </div>
                      <Form.Control.Feedback type="invalid">
                        {otpError}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Please check your email for the 6-digit verification code.
                      </Form.Text>
                    </Form.Group>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value)
                        setPhoneError(validatePhone(e.target.value, phoneTouched))
                      }}
                      onBlur={() => {
                        setPhoneTouched(true)
                        setPhoneError(validatePhone(phoneNumber, true))
                      }}
                      isInvalid={!!phoneError}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {phoneError}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            setPasswordError(validatePassword(e.target.value, passwordTouched))
                            // Re-validate confirm password if it exists
                            if (confirmPassword) {
                              setConfirmPasswordError(validateConfirmPassword(confirmPassword, confirmPasswordTouched))
                            }
                          }}
                          onBlur={() => {
                            setPasswordTouched(true)
                            setPasswordError(validatePassword(password, true))
                          }}
                          isInvalid={!!passwordError}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {passwordError}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </div>
                    
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            setConfirmPasswordError(validateConfirmPassword(e.target.value, confirmPasswordTouched))
                          }}
                          onBlur={() => {
                            setConfirmPasswordTouched(true)
                            setConfirmPasswordError(validateConfirmPassword(confirmPassword, true))
                          }}
                          isInvalid={!!confirmPasswordError}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {confirmPasswordError}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </div>
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Address (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Enter your address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button 
                      variant="success" 
                      type="submit" 
                      disabled={
                        loading || 
                        !otpVerified || 
                        !firstName.trim() || 
                        !lastName.trim() || 
                        !email.trim() || 
                        !phoneNumber.trim() || 
                        !password || 
                        !confirmPassword || 
                        !!firstNameError || 
                        !!lastNameError || 
                        !!emailError || 
                        !!phoneError || 
                        !!passwordError || 
                        !!confirmPasswordError
                      }
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </div>
                  
                  {!otpVerified && (
                    <div className="text-center mt-2">
                      <small className="text-muted">
                        Please verify your email to enable registration
                      </small>
                    </div>
                  )}
                  
                  <div className="text-center mt-3">
                    <p>Already have an account? <Link to="/login" className="text-decoration-none">Login here</Link></p>
                  </div>
                </Form>
        </div>
        </div>
      </div>
    </div>
  )
}

export default Register