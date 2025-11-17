import React from 'react'
import { Modal, Button } from 'react-bootstrap'

interface CustomerSupportModalProps {
  show: boolean
  onHide: () => void
}

const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Customer Support</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <div className="mb-3">
          <i className="bi bi-envelope text-primary mb-2" style={{fontSize: '2rem'}}></i>
          <div className="fw-bold">Email:</div>
          <div className="text-muted">apgovtlisence@gmail.com</div>
        </div>
        <div className="mb-3">
          <i className="bi bi-telephone text-success mb-2" style={{fontSize: '2rem'}}></i>
          <div className="fw-bold">Phone:</div>
          <div className="text-muted">9876543221</div>
        </div>
        <div className="mb-3">
          <i className="bi bi-geo-alt text-info mb-2" style={{fontSize: '2rem'}}></i>
          <div className="fw-bold">Address:</div>
          <div className="text-muted">
            Government Secretariat,<br />
            Velagapudi, Amaravati,<br />
            Andhra Pradesh - 522503
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default CustomerSupportModal