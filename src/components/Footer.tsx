import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-light py-2 mt-auto">
      <Container>
        <Row className="align-items-center">
          <Col md={6}>
            <small>&copy; 2024 Government License Portal</small>
          </Col>
          <Col md={6} className="text-md-end">
            <small>
              <Link to="/" className="text-light text-decoration-none me-3">Home</Link>
              <span className="me-3">Help: 1-800-GOV-HELP</span>
              <span>support@gov.portal</span>
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer