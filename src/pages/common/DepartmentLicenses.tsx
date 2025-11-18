import { useState, useEffect, useCallback, useMemo } from 'react'
import { Container, Row, Col, Card, Button, Alert, Modal, Form, Badge, InputGroup } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { licenseTypeService } from '../../services/licenseTypeService'
import { departmentDetailsService } from '../../services/departmentDetailsService'
import type { RootState } from '../../app/store'
import type { LicenseType, Department, UpdateLicenseType, CreateLicenseType } from '../../types'
import { UserRole } from '../../types/enums'

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
    console.log('Computing filtered license types:', { licenseTypes: licenseTypes.length, searchTerm, isAdmin })
    
    // First filter by admin status
    let filtered = isAdmin ? licenseTypes : licenseTypes.filter((lt: LicenseType) => lt.isActive)
    console.log('After admin filter:', filtered.length)
    
    // Then filter by search term
    if (searchTerm) {
      filtered = filtered.filter(license => 
        license.licenseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        license.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    console.log('Final filtered result:', filtered.length)
    return filtered
  }, [licenseTypes, searchTerm, isAdmin])

  const fetchData = useCallback(async () => {
    if (!departmentId) return
    
    try {
      const deptId = parseInt(departmentId)
      console.log('Fetching data for department ID:', deptId)
      
      const { department: deptData, licenseTypes: licenseData } = await departmentDetailsService.getDepartmentWithLicenseTypes(deptId)
      
      console.log('Department data:', deptData)
      console.log('License types data:', licenseData)
      
      setDepartment(deptData)
      
      // Ensure licenseData is an array and set all license types
      const licenseArray = Array.isArray(licenseData) ? licenseData : []
      console.log('Setting license types, array length:', licenseArray.length)
      
      // Always set all license types, filtering will be done in the component render
      setLicenseTypes(licenseArray)
    } catch (err) {
      console.error('Error in fetchData:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [departmentId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleApply = (licenseType: LicenseType) => {
    navigate('/apply-license', { state: { licenseType } })
  }

  const handleCreate = () => {
    setEditingLicense(null)
    setFormData({
      LicenseName: '',
      Description: '',
      ProcessingFee: 0,
      DepartmentId: department?.departmentId || 0,
      IsActive: true
    })
    setImageFile(null)
    setShowModal(true)
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
    setImageFile(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!department) return
    
    try {
      setUploading(true)
      let licenseTypeId: number
      
      if (editingLicense) {
        // Update existing license type
        const updateData: UpdateLicenseType = {
          LicenseTypeId: editingLicense.licenseTypeId,
          LicenseName: formData.LicenseName,
          Description: formData.Description,
          ProcessingFee: formData.ProcessingFee,
          DepartmentId: department.departmentId,
          IsActive: formData.IsActive
        }
        await licenseTypeService.updateAndGetList(updateData)
        licenseTypeId = editingLicense.licenseTypeId
      } else {
        // Create new license type
        const createData: CreateLicenseType = {
          LicenseName: formData.LicenseName,
          Description: formData.Description,
          ProcessingFee: formData.ProcessingFee,
          DepartmentId: department.departmentId
        }
        const result = await licenseTypeService.createAndGetList(createData)
        licenseTypeId = result.createdLicenseType?.licenseTypeId || 0
      }
      
      // Upload image if selected
      if (imageFile && licenseTypeId > 0) {
        await licenseTypeService.uploadImage(licenseTypeId, imageFile)
      }
      
      // Refresh data after any operation
      await fetchData()
      
      setShowModal(false)
      setImageFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${editingLicense ? 'update' : 'create'} license type`)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await licenseTypeService.deleteAndGetList(id)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete license type')
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

  console.log('Rendering component with:', { 
    licenseTypesLength: licenseTypes.length, 
    filteredLength: filteredLicenseTypes.length,
    loading,
    error,
    department: department?.departmentName 
  })

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>{department.departmentName}</h2>
          {department.description && (
            <p className="text-muted mb-0">{department.description}</p>
          )}
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={handleCreate}>
            Add License Type
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
              placeholder="Search license types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      {/* License Types Cards */}
      <Row>
        {filteredLicenseTypes.length === 0 ? (
          <Col>
            <Alert variant="info" className="text-center">
              <h5>No License Types Found</h5>
              <p className="mb-0">
                {searchTerm ? 
                  `No license types found matching "${searchTerm}"` : 
                  'No license types are currently available for this department'
                }
              </p>
              {isAdmin && !searchTerm && (
                <div className="mt-3">
                  <Button variant="primary" onClick={handleCreate}>
                    Add First License Type
                  </Button>
                </div>
              )}
            </Alert>
          </Col>
        ) : (
          filteredLicenseTypes.map((licenseType) => (
            <Col md={3} key={licenseType.licenseTypeId} className="mb-3">
              <Card className="h-100">
                {licenseType.image && (
                  <Card.Img 
                    variant="top" 
                    src={`data:image/jpeg;base64,${licenseType.image}`}
                    style={{ height: '120px', objectFit: 'cover' }}
                    alt={licenseType.licenseName}
                  />
                )}
                <Card.Body className="p-3 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="mb-0 h6">{licenseType.licenseName}</Card.Title>
                    {isAdmin && (
                      <Badge bg={licenseType.isActive ? 'success' : 'secondary'} className="small">
                        {licenseType.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    )}
                  </div>
                  <Card.Text className="flex-grow-1 small text-muted">
                    {licenseType.description || 'No description available'}
                  </Card.Text>
                  <div className="mt-auto">
                    <div className="mb-2 small">
                      <strong>Fee:</strong> ₹{licenseType.processingFee}
                    </div>
                    {isAdmin ? (
                      <div className="d-flex gap-1">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleEdit(licenseType)}
                          className="flex-fill"
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(licenseType.licenseTypeId)}
                          className="flex-fill"
                        >
                          Delete
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="primary" 
                        size="sm"
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
          ))
        )}
      </Row>
      

      
      {/* Add spacing before footer */}
      <div className="mb-5"></div>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingLicense ? 'Edit' : 'Create'} License Type</Modal.Title>
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
          <Button 
            variant="primary" 
            onClick={handleSave} 
            disabled={uploading || !formData.LicenseName}
          >
            {uploading ? (editingLicense ? 'Updating...' : 'Creating...') : (editingLicense ? 'Update' : 'Create')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default DepartmentLicenses