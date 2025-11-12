import { useState, useEffect, useCallback, useMemo } from 'react'
import { Container, Row, Col, Card, Button, Alert, Breadcrumb, Modal, Form, Badge, InputGroup } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { licenseTypeService } from '../services/licenseTypeService'
import { departmentService } from '../services/departmentService'
import type { RootState } from '../store'
import type { LicenseType, Department, UpdateLicenseType } from '../types'
import { UserRole } from '../types/enums'

function DepartmentLicenses() {
  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([])
  const [department, setDepartment] = useState<Department | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingLicense, setEditingLicense] = useState<LicenseType | null>(null)
  const [formData, setFormData] = useState({
    LicenseName: '',
    Description: '',
    ProcessingFee: 0,
    DepartmentId: 0,
    IsActive: true
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  
  const navigate = useNavigate()
  const { departmentId } = useParams<{ departmentId: string }>()
  const { user } = useSelector((state: RootState) => state.auth)
  const isAdmin = user?.role === UserRole.Admin

  const filteredLicenseTypes = useMemo(() => {
    if (!searchTerm) return licenseTypes
    
    return licenseTypes.filter(license => 
      license.licenseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [licenseTypes, searchTerm])

  const fetchData = useCallback(async () => {
    if (!departmentId) return
    
    try {
      const deptId = parseInt(departmentId)
      const [deptData, licenseData] = await Promise.all([
        departmentService.getById(deptId),
        licenseTypeService.getByDepartment(deptId)
      ])
      
      setDepartment(deptData)
      setLicenseTypes(isAdmin ? licenseData : licenseData.filter(lt => lt.isActive))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [departmentId, isAdmin])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleApply = (licenseType: LicenseType) => {
    navigate('/apply-license', { state: { licenseType } })
  }

  const handleEdit = (licenseType: LicenseType) => {
    setEditingLicense(licenseType)
    setFormData({
      LicenseName: licenseType.licenseName,
      Description: licenseType.description || '',
      ProcessingFee: licenseType.processingFee,
      DepartmentId: licenseType.departmentId,
      IsActive: licenseType.isActive
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!editingLicense) return
    
    try {
      setUploading(true)
      const updateData: UpdateLicenseType = {
        LicenseTypeId: editingLicense.licenseTypeId,
        ...formData
      }
      await licenseTypeService.update(updateData)
      
      // Upload image if selected
      if (imageFile) {
        await licenseTypeService.uploadImage(editingLicense.licenseTypeId, imageFile)
      }
      
      setShowModal(false)
      setImageFile(null)
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update license type')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this license type?')) {
      try {
        await licenseTypeService.delete(id)
        fetchData()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete license type')
      }
    }
  }

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">Loading...</div>
      </Container>
    )
  }

  if (!department) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">Department not found</Alert>
      </Container>
    )
  }

  return (
    <Container className="mt-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item onClick={() => navigate('/departments')} style={{ cursor: 'pointer' }}>
          Departments
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{department.departmentName}</Breadcrumb.Item>
      </Breadcrumb>

      <div className="mb-4">
        <h2>{department.departmentName}</h2>
        {department.description && (
          <p className="text-muted">{department.description}</p>
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
              placeholder="Search license types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      {/* License Types Cards */}
      <Row>
        {filteredLicenseTypes.map((licenseType) => (
          <Col md={6} lg={4} key={licenseType.licenseTypeId} className="mb-4">
            <Card className="h-100">
              {licenseType.image && (
                <Card.Img 
                  variant="top" 
                  src={`data:image/jpeg;base64,${licenseType.image}`}
                  style={{ height: '200px', objectFit: 'cover' }}
                  alt={licenseType.licenseName}
                />
              )}
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Card.Title className="mb-0">{licenseType.licenseName}</Card.Title>
                  {isAdmin && (
                    <Badge bg={licenseType.isActive ? 'success' : 'secondary'}>
                      {licenseType.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                </div>
                <Card.Text className="flex-grow-1">
                  {licenseType.description || 'No description available'}
                </Card.Text>
                <div className="mt-auto">
                  <div className="mb-3">
                    <strong>Processing Fee:</strong> ₹{licenseType.processingFee}
                  </div>
                  {isAdmin ? (
                    <div className="d-flex gap-2">
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleApply(licenseType)}
                        className="flex-fill"
                      >
                        Apply
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleEdit(licenseType)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDelete(licenseType.licenseTypeId)}
                      >
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="primary" 
                      onClick={() => handleApply(licenseType)}
                      className="w-100"
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredLicenseTypes.length === 0 && !error && (
        <div className="text-center">
          <p>{searchTerm ? 'No license types found matching your search.' : 'No license types available in this department.'}</p>
        </div>
      )}

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit License Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>License Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.LicenseName}
                onChange={(e) => setFormData({...formData, LicenseName: e.target.value})}
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
              <Form.Label>Processing Fee</Form.Label>
              <Form.Control
                type="number"
                value={formData.ProcessingFee}
                onChange={(e) => setFormData({...formData, ProcessingFee: Number(e.target.value)})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>License Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  setImageFile(file || null)
                }}
              />
              <Form.Text className="text-muted">
                Upload an image for this license type (JPEG, PNG, GIF - Max 5MB)
              </Form.Text>
            </Form.Group>
            <Form.Check
              type="checkbox"
              label="Active"
              checked={formData.IsActive}
              onChange={(e) => setFormData({...formData, IsActive: e.target.checked})}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={uploading}>
            {uploading ? 'Updating...' : 'Update'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default DepartmentLicenses