import { useState, useEffect } from 'react'
import { Form, Button, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice'
import { authService } from '../services/authService'

function Login() {
  // Local form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  
  // Redux state and dispatch
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated, user } = useAppSelector((state) => state.auth)

  // Check if user is already authenticated on component mount
  useEffect(() => {
    // Only redirect if user is authenticated AND there's no error
    // This handles the case where user is already logged in
    if (isAuthenticated && !error) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, error, navigate])

  // Validation functions
  const validateEmail = (email: string, touched: boolean): string => {
    if (touched && !email.trim()) return 'Email is required'
    if (email && email.includes(' ')) return 'Email cannot contain spaces'
    if (email && !email.endsWith('@gmail.com')) return 'Email must end with @gmail.com'
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate inputs
    const emailErr = validateEmail(email, true)
    const passwordErr = validatePassword(password, true)
    
    setEmailError(emailErr)
    setPasswordError(passwordErr)
    
    // Stop if validation fails
    if (emailErr || passwordErr) return
    
    // Start login process
    dispatch(loginStart())
    
    try {
      // Call real API
      const response = await authService.login({ email, password })
      
      // Success - dispatch login success
      dispatch(loginSuccess({
        user: {
          userId: response.userId,
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          role: response.role,
          departmentName: response.departmentName
        },
        token: response.token
      }))
      
      // Navigate to home
      navigate('/')
    } catch (error: unknown) {
      // Failure - dispatch login failure
      dispatch(loginFailure(error instanceof Error ? error.message : 'An error occurred'))
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
        
        {/* Login Form Section */}
        <div className="col-12 col-md-6 d-flex align-items-center justify-content-center" style={{backgroundColor: 'white'}}>
          <div className="w-100 px-4 py-5" style={{maxWidth: '400px'}}>
            <div className="text-center mb-4">
              <h3 className="text-primary mb-2">Login to Your Account</h3>
              <p className="text-muted">Enter your credentials to access the system</p>
            </div>
            {error && (
              <Alert variant="danger" className="mb-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Invalid email or password. Please try again.
              </Alert>
            )}
            
            {isAuthenticated && user && (
              <Alert variant="success">
                Welcome back, {user.firstName} {user.lastName}!
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your gmail"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailError(validateEmail(e.target.value, emailTouched))
                  }}
                  onBlur={() => {
                    setEmailTouched(true)
                    setEmailError(validateEmail(email, true))
                  }}
                  isInvalid={!!emailError}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {emailError}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError(validatePassword(e.target.value, passwordTouched))
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

              <div className="d-grid mb-3">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </div>
              
              <div className="text-center">
                <p className="mb-2">Don't have an account? <Link to="/register" className="text-decoration-none">Register here</Link></p>
                <p className="mb-0"><Link to="/forgot-password" className="text-decoration-none">Forgot your password?</Link></p>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login