import React, { useState, useEffect } from 'react'
import { applicationQueryService } from '../../services/applicationQueryService'
import { documentService } from '../../services/documentService'
import { applicationActionService } from '../../services/applicationActionService'
import type { ApplicationListItem, CertificateWithData } from '../../types'

// Extend ApplicationListItem to include certificates
interface ApplicationWithCertificates extends ApplicationListItem {
  certificates?: CertificateWithData[]
}

const MyLicenseCertifications: React.FC = () => {
  const [approvedApplications, setApprovedApplications] = useState<ApplicationWithCertificates[]>([])
  const [certificates, setCertificates] = useState<{ [key: number]: CertificateWithData[] }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLicenseCertifications()
  }, [])

  const fetchLicenseCertifications = async () => {
    try {
      const data = await applicationQueryService.getMyApplicationsWithCertificates()
      
      // Filter approved applications for licenses
      const approved = data.filter((app: ApplicationWithCertificates) => app.status === 8) // Status 8 = Approved
      setApprovedApplications(approved)
      
      // Process certificates data
      const certificatesData: { [key: number]: CertificateWithData[] } = {}
      approved.forEach((app: ApplicationWithCertificates) => {
        if (app.certificates && app.certificates.length > 0) {
          // Filter to show only Official License Certificate documents
          const officialCerts = app.certificates.filter((cert: CertificateWithData) => 
            cert.documentName.toLowerCase().includes('official license certificate')
          )
          if (officialCerts.length > 0) {
            certificatesData[app.applicationId] = officialCerts
          }
        }
      })
      setCertificates(certificatesData)
    } catch (error) {
      console.error('Error fetching license certifications:', error)
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

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{height: '16rem'}}>Loading...</div>
  }

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4">My License Certifications</h3>
      
      {approvedApplications.length === 0 ? (
        <div className="text-center py-5">
          <div className="mx-auto bg-light rounded-circle d-flex align-items-center justify-content-center mb-4" style={{width: '96px', height: '96px'}}>
            <i className="fas fa-certificate fa-3x text-muted"></i>
          </div>
          <h5 className="mb-2">No licenses yet</h5>
          <p className="text-muted">You don't have any approved licenses yet. Apply for a license to get started.</p>
        </div>
      ) : (
        <div className="row g-3">
          {approvedApplications.map((app) => (
            <div key={app.applicationId} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title mb-2">{app.licenseTypeName}</h6>
                  <small className="text-muted mb-1">#{app.applicationNumber}</small>
                  <small className="text-muted mb-2">{new Date(app.appliedDate).toLocaleDateString()}</small>

                  {certificates[app.applicationId] && certificates[app.applicationId].length > 0 && (
                    <div className="border-top pt-2 mb-2">
                      <small className="fw-bold text-muted">Certificates:</small>
                      <div className="mt-1">
                        {certificates[app.applicationId].slice(0, 2).map((cert) => (
                          <div key={cert.documentId} className="d-flex justify-content-between align-items-center py-1">
                            <small className="text-truncate me-2">{cert.documentName}</small>
                            <button
                              onClick={() => handleDownloadCertificate(cert.documentId, cert.fileName)}
                              className="btn btn-link btn-sm p-0 text-decoration-none"
                              style={{fontSize: '12px'}}
                            >
                              <i className="fas fa-download"></i>
                            </button>
                          </div>
                        ))}
                        {certificates[app.applicationId].length > 2 && (
                          <small className="text-muted">+{certificates[app.applicationId].length - 2} more</small>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-auto">
                    <button
                      onClick={() => handleDownloadOfficialCertificate(app.applicationId)}
                      className="btn btn-success btn-sm w-100"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyLicenseCertifications