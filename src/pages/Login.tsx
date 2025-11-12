import { useState, useEffect } from 'react'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
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

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/departments')
    }
  }, [isAuthenticated, navigate])

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
      
      // Navigate to departments
      navigate('/departments')
    } catch (error: unknown) {
      // Failure - dispatch login failure
      dispatch(loginFailure(error instanceof Error ? error.message : 'An error occurred'))
    }
  }
  


  return (
    <div className="login-container">
      <Container>
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
          <Card>
            <Card.Header className="text-center">
              <h3>Login to Your Account</h3>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger">
                  {error}
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

                <div className="d-grid">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
                
                <div className="text-center mt-3">
                  <p>Don't have an account? <Link to="/register">Register here</Link></p>
                  <p><Link to="/forgot-password">Forgot your password?</Link></p>
                </div>
              </Form>
            </Card.Body>
          </Card>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Login