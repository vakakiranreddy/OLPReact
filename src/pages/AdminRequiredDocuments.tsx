import React, { useState, useEffect } from 'react'
import { licenseTypeService } from '../services/licenseTypeService'
import { requiredDocumentService } from '../services/requiredDocumentService'
import type { LicenseType, RequiredDocument, CreateRequiredDocument, UpdateRequiredDocument } from '../types'

const RequiredDocuments: React.FC = () => {
  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([])
  const [filteredLicenseTypes, setFilteredLicenseTypes] = useState<LicenseType[]>([])
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([])
  const [selectedLicenseTypeForDocs, setSelectedLicenseTypeForDocs] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateDoc, setShowCreateDoc] = useState(false)
  const [showEditDoc, setShowEditDoc] = useState(false)
  const [editingDoc, setEditingDoc] = useState<RequiredDocument | null>(null)
  const [newDoc, setNewDoc] = useState<CreateRequiredDocument>({
    documentName: '',
    description: '',
    isMandatory: true,
    licenseTypeId: 0
  })

  useEffect(() => {
    loadLicenseTypes()
  }, [])

  const loadLicenseTypes = async () => {
    setLoading(true)
    try {
      const licenseTypesData = await licenseTypeService.getAll()
      setLicenseTypes(licenseTypesData)
      setFilteredLicenseTypes(licenseTypesData)
    } catch (error) {
      console.error('Error loading license types:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.trim() === '') {
      setFilteredLicenseTypes(licenseTypes)
    } else {
      const filtered = licenseTypes.filter(lt => 
        lt.licenseName.toLowerCase().includes(term.toLowerCase()) ||
        (lt.description && lt.description.toLowerCase().includes(term.toLowerCase()))
      )
      setFilteredLicenseTypes(filtered)
    }
  }

  const handleLicenseTypeClick = async (licenseTypeId: number) => {
    setSelectedLicenseTypeForDocs(licenseTypeId)
    setLoading(true)
    try {
      const docs = await requiredDocumentService.getByLicenseType(licenseTypeId)
      setRequiredDocuments(docs)
    } catch (error) {
      console.error('Error loading required documents:', error)
      setRequiredDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await requiredDocumentService.create(newDoc)
      setShowCreateDoc(false)
      setNewDoc({
        documentName: '',
        description: '',
        isMandatory: true,
        licenseTypeId: 0
      })
      if (selectedLicenseTypeForDocs) {
        handleLicenseTypeClick(selectedLicenseTypeForDocs)
      }
    } catch (error) {
      console.error('Error creating document:', error)
    }
  }

  const handleEditDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDoc) return
    
    try {
      const updateData: UpdateRequiredDocument = {
        requiredDocumentId: editingDoc.requiredDocumentId,
        documentName: editingDoc.documentName,
        description: editingDoc.description,
        isMandatory: editingDoc.isMandatory
      }
      await requiredDocumentService.update(updateData)
      setShowEditDoc(false)
      setEditingDoc(null)
      if (selectedLicenseTypeForDocs) {
        handleLicenseTypeClick(selectedLicenseTypeForDocs)
      }
    } catch (error) {
      console.error('Error updating document:', error)
    }
  }

  const handleDeleteDoc = async (docId: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await requiredDocumentService.delete(docId)
        if (selectedLicenseTypeForDocs) {
          handleLicenseTypeClick(selectedLicenseTypeForDocs)
        }
      } catch (error) {
        console.error('Error deleting document:', error)
      }
    }
  }

  const startEditDoc = (doc: RequiredDocument) => {
    setEditingDoc(doc)
    setShowEditDoc(true)
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Required Documents Management</h2>
            {selectedLicenseTypeForDocs && (
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setNewDoc({...newDoc, licenseTypeId: selectedLicenseTypeForDocs})
                  setShowCreateDoc(true)
                }}
              >
                <i className="fas fa-plus me-2"></i>Add Document
              </button>
            )}
          </div>

          <div className="row">
            {/* License Types List */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">License Types</h5>
                  <div className="mt-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search license types..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="card-body p-0">
                  {loading && !selectedLicenseTypeForDocs ? (
                    <div className="text-center py-4">
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {filteredLicenseTypes.map(licenseType => (
                        <button
                          key={licenseType.licenseTypeId}
                          className={`list-group-item list-group-item-action ${
                            selectedLicenseTypeForDocs === licenseType.licenseTypeId ? 'active' : ''
                          }`}
                          onClick={() => handleLicenseTypeClick(licenseType.licenseTypeId)}
                        >
                          <div className="d-flex w-100 justify-content-between">
                            <h6 className="mb-1">{licenseType.licenseName}</h6>
                            <small className="text-muted">₹{licenseType.processingFee}</small>
                          </div>
                          <p className="mb-1 text-truncate">{licenseType.description}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Required Documents */}
            <div className="col-md-8">
              {selectedLicenseTypeForDocs ? (
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      Required Documents - {licenseTypes.find(lt => lt.licenseTypeId === selectedLicenseTypeForDocs)?.licenseName}
                    </h5>
                  </div>
                  <div className="card-body">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : requiredDocuments.length === 0 ? (
                      <div className="text-center py-4">
                        <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                        <p className="text-muted">No required documents found for this license type.</p>
                      </div>
                    ) : (
                      <div className="row">
                        {requiredDocuments.map(doc => (
                          <div key={doc.requiredDocumentId} className="col-md-6 col-lg-4 mb-3">
                            <div className="card h-100">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h6 className="card-title mb-0">{doc.documentName}</h6>
                                  <span className={`badge ${doc.isMandatory ? 'bg-danger' : 'bg-secondary'}`}>
                                    {doc.isMandatory ? 'Required' : 'Optional'}
                                  </span>
                                </div>
                                <p className="card-text small text-muted">{doc.description}</p>
                              </div>
                              <div className="card-footer">
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-outline-primary flex-fill"
                                    onClick={() => startEditDoc(doc)}
                                  >
                                    <i className="fas fa-edit me-1"></i>Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger flex-fill"
                                    onClick={() => handleDeleteDoc(doc.requiredDocumentId)}
                                  >
                                    <i className="fas fa-trash me-1"></i>Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="card-body text-center py-5">
                    <i className="fas fa-mouse-pointer fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">Select a License Type</h5>
                    <p className="text-muted">Choose a license type from the left to view and manage its required documents.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Document Modal */}
      {showCreateDoc && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Required Document</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowCreateDoc(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateDoc}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Document Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newDoc.documentName}
                      onChange={(e) => setNewDoc({...newDoc, documentName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={newDoc.description}
                      onChange={(e) => setNewDoc({...newDoc, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={newDoc.isMandatory}
                        onChange={(e) => setNewDoc({...newDoc, isMandatory: e.target.checked})}
                      />
                      <label className="form-check-label">
                        Mandatory Document
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateDoc(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Document
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {showEditDoc && editingDoc && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Required Document</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowEditDoc(false)}
                ></button>
              </div>
              <form onSubmit={handleEditDoc}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Document Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingDoc.documentName}
                      onChange={(e) => setEditingDoc({...editingDoc, documentName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={editingDoc.description}
                      onChange={(e) => setEditingDoc({...editingDoc, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={editingDoc.isMandatory}
                        onChange={(e) => setEditingDoc({...editingDoc, isMandatory: e.target.checked})}
                      />
                      <label className="form-check-label">
                        Mandatory Document
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowEditDoc(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Document
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequiredDocuments