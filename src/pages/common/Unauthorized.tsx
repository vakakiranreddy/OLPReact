import { Container, Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function Unauthorized() {
  return (
    <div className="login-container">
      <Container>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <Card>
              <Card.Header className="text-center">
                <h3>Access Denied</h3>
              </Card.Header>
              <Card.Body className="text-center">
                <p>You don't have permission to access this page.</p>
                <Link to="/">
                  <Button variant="primary">Go Home</Button>
                </Link>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Unauthorized