import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { applicationQueryService } from '../services/applicationQueryService'
import type { ApplicationDetails as ApplicationDetailsType } from '../types'

const ApplicationDetails: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>()
  const [application, setApplication] = useState<ApplicationDetailsType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (applicationId) {
      fetchApplication()
    }
  }, [applicationId])

  const fetchApplication = async () => {
    try {
      const data = await applicationQueryService.getApplicationDetails(Number(applicationId))
      setApplication(data)
    } catch (error) {
      console.error('Error fetching application:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: number) => {
    const statusMap: { [key: number]: string } = {
      0: 'Draft',
      1: 'Submitted',
      2: 'Under Review',
      3: 'Verified',
      4: 'Approved',
      5: 'Rejected'
    }
    return statusMap[status] || 'Unknown'
  }

  const getStatusColor = (status: number) => {
    const colorMap: { [key: number]: string } = {
      0: 'bg-gray-100 text-gray-800',
      1: 'bg-blue-100 text-blue-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-purple-100 text-purple-800',
      4: 'bg-green-100 text-green-800',
      5: 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  if (!application) {
    return <div className="text-center py-8">Application not found.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Application Details
                </h1>
                <p className="text-gray-600 mt-1">{application.applicationNumber}</p>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
                {getStatusText(application.status)}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Application Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">License Type</label>
                    <p className="text-gray-900">{application.licenseTypeName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <p className="text-gray-900">{application.departmentName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Applied Date</label>
                    <p className="text-gray-900">{new Date(application.appliedDate).toLocaleDateString()}</p>
                  </div>
                  {application.paymentAmount && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Amount</label>
                      <p className="text-gray-900">${application.paymentAmount}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Applicant Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{application.applicantName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{application.applicantEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{application.applicantPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {application.reviewerName && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Review Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reviewer</label>
                    <p className="text-gray-900">{application.reviewerName}</p>
                  </div>
                  {application.verifiedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Verified Date</label>
                      <p className="text-gray-900">{new Date(application.verifiedDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {application.applicantRemarks && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-2">Applicant Remarks</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{application.applicantRemarks}</p>
              </div>
            )}

            {application.rejectionReason && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-2 text-red-600">Rejection Reason</h3>
                <p className="text-red-700 bg-red-50 p-3 rounded border border-red-200">{application.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationDetails