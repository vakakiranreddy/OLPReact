import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { ApplicationListItem, ApplicationDetails } from '../../types'

interface ApplicationState {
  applications: ApplicationListItem[]
  selectedApplication: ApplicationDetails | null
  loading: boolean
  error: string | null
  statistics: { userId: number; applicationCount: number } | null
}

const initialState: ApplicationState = {
  applications: [],
  selectedApplication: null,
  loading: false,
  error: null,
  statistics: null,
}

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    setApplications: (state, action: PayloadAction<ApplicationListItem[]>) => {
      state.applications = action.payload
      state.loading = false
      state.error = null
    },
    
    setSelectedApplication: (state, action: PayloadAction<ApplicationDetails | null>) => {
      state.selectedApplication = action.payload
    },
    
    updateApplicationStatus: (state, action: PayloadAction<{ applicationId: number; status: number }>) => {
      const { applicationId, status } = action.payload
      const application = state.applications.find(app => app.applicationId === applicationId)
      if (application) {
        application.status = status
      }
    },
    
    setStatistics: (state, action: PayloadAction<{ userId: number; applicationCount: number }>) => {
      state.statistics = action.payload
    },
    
    clearApplications: (state) => {
      state.applications = []
      state.selectedApplication = null
      state.statistics = null
    },
  },
})

export const {
  setLoading,
  setError,
  setApplications,
  setSelectedApplication,
  updateApplicationStatus,
  setStatistics,
  clearApplications,
} = applicationSlice.actions

export default applicationSlice.reducer