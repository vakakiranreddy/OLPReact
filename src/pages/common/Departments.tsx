import { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Card, Button, Alert, Form, InputGroup, Modal } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { departmentService } from '../../services/departmentService'
import type { RootState } from '../../app/store'
import type { Department, CreateDepartment, UpdateDepartment } from '../../types'
import { UserRole } from '../../types/enums'

function Departments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState<CreateDepartment>({
    DepartmentName: '',
    Description: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const isAdmin = user?.role === UserRole.Admin

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const data = await departmentService.getAll()
      setDepartments(data)
      setError('')
    } catch (err) {
      console.error('Error loading departments:', err)
      setError('Failed to load departments. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredDepartments = useMemo(() => {
    if (!searchTerm) return departments
    
    return departments.filter(dept => 
      dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [departments, searchTerm])

  useEffect(() => {
    fetchDepartments()
  }, [isAdmin])

  const handleViewLicenses = (department: Department) => {
    navigate(`/departments/${department.departmentId}/licenses`)
  }

  const handleCreate = () => {
    setEditingDepartment(null)
    setFormData({
      DepartmentName: '',
      Description: ''
    })
    setShowModal(true)
  }

  const handleEdit = (department: Department) => {
    setEditingDepartment(department)
    setFormData({
      DepartmentName: department.departmentName,
      Description: department.description || ''
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      setUploading(true)
      let departmentId: number
      
      if (editingDepartment) {
        const updateData: UpdateDepartment = {
          DepartmentId: editingDepartment.departmentId,
          ...formData,
          IsActive: editingDepartment.isActive ?? true
        }
        await departmentService.update(updateData)
        departmentId = editingDepartment.departmentId
      } else {
        const newDepartment = await departmentService.create(formData)
        departmentId = newDepartment.departmentId
      }
      
      // Upload image if selected
      if (imageFile) {
        await departmentService.uploadImage(departmentId, imageFile)
      }
      
      setShowModal(false)
      setImageFile(null)
      await fetchDepartments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save department')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentService.delete(id)
        await fetchDepartments()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete department')
      }
    }
  }

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">Loading departments...</div>
      </Container>
    )
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Departments</h2>
        {isAdmin && (
          <Button variant="primary" onClick={handleCreate}>
            Add New Department
          </Button>
        )}
      </div>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      {/* Department Cards */}
      <Row className="g-3">
        {filteredDepartments.map((department) => (
          <Col md={3} key={department.departmentId}>
            <Card className="h-100">
              {department.image && (
                <Card.Img 
                  variant="top" 
                  src={`data:image/jpeg;base64,${department.image}`}
                  style={{ height: '150px', objectFit: 'cover' }}
                  alt={department.departmentName}
                />
              )}
              <Card.Body className="d-flex flex-column p-3">
                <Card.Title className="h6">{department.departmentName}</Card.Title>
                <Card.Text className="flex-grow-1 small">
                  {department.description || 'Government department providing various license services'}
                </Card.Text>
                <div className="mt-auto">
                  {isAdmin && (
                    <div className="mb-2">
                      <small className="text-muted">
                        {department.licenseTypeCount || 0} License Types • {department.userCount || 0} Users
                      </small>
                    </div>
                  )}
                  {isAdmin ? (
                    <div className="d-flex gap-2">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleViewLicenses(department)}
                        className="flex-fill"
                      >
                        View Licenses
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleEdit(department)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDelete(department.departmentId)}
                      >
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="primary" 
                      onClick={() => handleViewLicenses(department)}
                      className="w-100"
                    >
                      View License Types
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredDepartments.length === 0 && !error && (
        <div className="text-center">
          <p>No departments found.</p>
        </div>
      )}

      {/* Admin Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingDepartment ? 'Edit' : 'Create'} Department</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Department Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.DepartmentName}
                onChange={(e) => setFormData({...formData, DepartmentName: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.Description}
                onChange={(e) => setFormData({...formData, Description: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Department Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  setImageFile(file || null)
                }}
              />
              <Form.Text className="text-muted">
                Upload an image for this department (JPEG, PNG, GIF - Max 5MB)
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={uploading}>
            {uploading ? 'Saving...' : (editingDepartment ? 'Update' : 'Create')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Departments