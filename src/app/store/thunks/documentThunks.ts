import { createAsyncThunk } from '@reduxjs/toolkit'
import { documentService } from '../../../services/documentService'
import { setDocuments, setLoading, setError } from '../slices/documentSlice'
import { showError } from '../slices/notificationSlice'

// Fetch application documents
export const fetchApplicationDocuments = createAsyncThunk(
  'documents/fetchApplicationDocuments',
  async (applicationId: number, { dispatch }) => {
    try {
      dispatch(setLoading(true))
      const documents = await documentService.getApplicationDocuments(applicationId)
      dispatch(setDocuments(documents))
    } catch {
      dispatch(setError('Error fetching documents'))
      dispatch(showError('Failed to load documents'))
    }
  }
)

// Preview document
export const previewDocument = createAsyncThunk(
  'documents/previewDocument',
  async (documentId: number, { dispatch }) => {
    try {
      const blob = await documentService.downloadDocument(documentId)
      const reader = new FileReader()
      
      return new Promise<void>((resolve) => {
        reader.onload = () => {
         
          resolve()
        }
        reader.readAsDataURL(blob)
      })
    } catch {
      dispatch(showError('Error loading document preview'))
    }
  }
)