import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { applicationQueryService } from '../services/applicationQueryService'
import { documentService } from '../services/documentService'
import { applicationActionService } from '../services/applicationActionService'
import type { ApplicationListItem, DocumentResponse } from '../types'

const MyApplications: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [filteredApplications, setFilteredApplications] = useState<ApplicationListItem[]>([])
  const [selectedApp, setSelectedApp] = useState<ApplicationListItem | null>(null)
  const [appDocuments, setAppDocuments] = useState<DocumentResponse[]>([])
  const [applications, setApplications] = useState<ApplicationListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm, statusFilter])

  const filterApplications = () => {
    let filtered = applications
    
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.licenseTypeName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (statusFilter) {
      filtered = filtered.filter(app => app.status === Number(statusFilter))
    }
    
    setFilteredApplications(filtered)
  }

  const fetchApplications = async () => {
    try {
      const data = await applicationQueryService.getMyApplications()
      setApplications(data)
      setFilteredApplications(data)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }



  const handleDownloadCertificate = async (documentId: number, fileName: string) => {
    try {
      const blob = await documentService.downloadDocument(documentId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading certificate:', error)
    }
  }

  const handleDownloadOfficialCertificate = async (applicationId: number) => {
    try {
      const blob = await applicationActionService.downloadCertificate(applicationId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `License_Certificate_${applicationId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading official certificate:', error)
    }
  }

  const handleViewApplication = async (app: ApplicationListItem) => {
    setSelectedApp(app)
    try {
      const docs = await documentService.getApplicationDocuments(app.applicationId)
      setAppDocuments(docs)
    } catch (error) {
      console.error('Error fetching application documents:', error)
    }
  }

  const getStatusProgress = (status: number) => {
    const steps = [
      { id: 0, name: 'Draft', color: 'bg-secondary' },
      { id: 2, name: 'Submitted', color: 'bg-info' },
      { id: 3, name: 'Under Review', color: 'bg-warning' },
      { id: 4, name: 'Verified', color: 'bg-primary' },
      { id: 8, name: 'Approved', color: 'bg-success' }
    ]
    
    if (status === 5) { // Rejected
      return steps.map((step, index) => ({
        ...step,
        active: index === 0,
        completed: false,
        rejected: index === steps.length - 1
      }))
    }
    
    return steps.map(step => ({
      ...step,
      active: step.id === status,
      completed: step.id < status || (status >= 8 && step.id <= 8),
      rejected: false
    }))
  }

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{height: '16rem'}}>Loading...</div>
  }

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4">My Applications</h3>
      
      {/* Search and Filter */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                placeholder="Search by license name or application number..."
                className="form-control"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="0">Draft</option>
                <option value="2">Submitted</option>
                <option value="3">Under Review</option>
                <option value="4">Verified</option>
                <option value="5">Rejected</option>
                <option value="8">Approved</option>
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-center">
              <small className="text-muted">
                Found {filteredApplications.length} applications
              </small>
            </div>
          </div>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No applications found.</p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredApplications.map((app) => (
            <div key={app.applicationId} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title mb-2">{app.licenseTypeName}</h6>
                  <small className="text-muted mb-1">#{app.applicationNumber}</small>
                  <small className="text-muted mb-3">{new Date(app.appliedDate).toLocaleDateString()}</small>
                  
                  <div className="mt-auto">
                    <div className="d-grid gap-1">
                      <button
                        onClick={() => handleViewApplication(app)}
                        className="btn btn-primary btn-sm"
                      >
                        View Details
                      </button>
                      {app.status === 0 && (
                        <button
                          onClick={() => navigate(`/draft-application/${app.applicationId}`)}
                          className="btn btn-info btn-sm"
                        >
                          Continue
                        </button>
                      )}
                      {app.status === 8 && (
                        <button
                          onClick={() => handleDownloadOfficialCertificate(app.applicationId)}
                          className="btn btn-success btn-sm"
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApp && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedApp.licenseTypeName}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedApp(null)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Status Progress Bar */}
                <div className="mb-4">
                  <h6 className="fw-bold mb-3">Application Progress</h6>
                  <div className="d-flex justify-content-between align-items-center">
                    {getStatusProgress(selectedApp.status).map((step, index) => (
                      <div key={step.id} className="d-flex flex-column align-items-center flex-fill">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold ${
                          step.completed ? 'bg-success' : step.active ? 'bg-primary' : step.rejected ? 'bg-danger' : 'bg-secondary'
                        }`} style={{width: '32px', height: '32px', fontSize: '12px'}}>
                          {step.completed ? '✓' : index + 1}
                        </div>
                        <small className="mt-1 text-center">{step.name}</small>
                        {index < getStatusProgress(selectedApp.status).length - 1 && (
                          <div className={`mt-2 ${
                            step.completed ? 'bg-success' : 'bg-secondary'
                          }`} style={{height: '2px', width: '100%'}}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Documents Section */}
                <div>
                  <h6 className="fw-bold mb-3">Uploaded Documents</h6>
                  {appDocuments.length === 0 ? (
                    <p className="text-muted">No documents uploaded yet.</p>
                  ) : (
                    <div className="row g-3">
                      {appDocuments.map((doc) => (
                        <div key={doc.documentId} className="col-12">
                          <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                            <div>
                              <p className="fw-medium mb-1">{doc.documentName}</p>
                              <small className="text-muted">{doc.fileName} • {(doc.fileSize / 1024).toFixed(1)} KB</small>
                            </div>
                            <button
                              onClick={() => handleDownloadCertificate(doc.documentId, doc.fileName)}
                              className="btn btn-primary btn-sm"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyApplications