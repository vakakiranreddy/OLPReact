import { createAsyncThunk } from '@reduxjs/toolkit'
import { applicationQueryService } from '../../../services/applicationQueryService'
import { applicationActionService } from '../../../services/applicationActionService'
import { setApplications, setStatistics, setLoading, setError } from '../slices/applicationSlice'
import { showSuccess, showError } from '../slices/notificationSlice'
import type { VerifyApplicationRequest, RejectApplicationRequest, ApproveApplicationRequest } from '../../../types'

// Fetch applications for reviewer
export const fetchReviewerApplications = createAsyncThunk(
  'applications/fetchReviewerApplications',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true))
      const [pendingData, reviewedData] = await Promise.all([
        applicationQueryService.getMyPendingReviews(),
        applicationQueryService.getMyReviewedApplications()
      ])
      
      const allApplications = [...pendingData, ...reviewedData]
      const uniqueApplications = allApplications.filter((app, index, self) => 
        index === self.findIndex(a => a.applicationId === app.applicationId)
      )
      
      dispatch(setApplications(uniqueApplications))
      
      const stats = await applicationQueryService.getMyStatistics()
      dispatch(setStatistics(stats))
    } catch {
      dispatch(setError('Error fetching applications'))
      dispatch(showError('Failed to load applications'))
    } finally {
      dispatch(setLoading(false))
    }
  }
)

// Verify application
export const verifyApplication = createAsyncThunk(
  'applications/verifyApplication',
  async (verifyData: VerifyApplicationRequest, { dispatch }) => {
    try {
      await applicationActionService.verify(verifyData)
      dispatch(showSuccess('Application verified successfully!'))
      dispatch(fetchReviewerApplications())
    } catch {
      dispatch(showError('Error verifying application'))
    }
  }
)

// Reject application
export const rejectApplication = createAsyncThunk(
  'applications/rejectApplication',
  async (rejectData: RejectApplicationRequest, { dispatch }) => {
    try {
      await applicationActionService.reject(rejectData)
      dispatch(showSuccess('Application rejected successfully!'))
      dispatch(fetchReviewerApplications())
    } catch {
      dispatch(showError('Error rejecting application'))
    }
  }
)

// Approve application
export const approveApplication = createAsyncThunk(
  'applications/approveApplication',
  async (approveData: ApproveApplicationRequest, { dispatch }) => {
    try {
      await applicationActionService.approve(approveData)
      dispatch(showSuccess('Application approved successfully!'))
    } catch {
      dispatch(showError('Error approving application'))
    }
  }
)

// Fetch all applications (for department head)
export const fetchAllApplications = createAsyncThunk(
  'applications/fetchAllApplications',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true))
      const data = await applicationQueryService.getAllApplications()
      dispatch(setApplications(data))
      
      const stats = await applicationQueryService.getMyStatistics()
      dispatch(setStatistics(stats))
    } catch {
      dispatch(setError('Error fetching applications'))
      dispatch(showError('Failed to load applications'))
    } finally {
      dispatch(setLoading(false))
    }
  }
)