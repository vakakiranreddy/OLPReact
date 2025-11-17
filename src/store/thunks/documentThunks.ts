import { createAsyncThunk } from '@reduxjs/toolkit'
import { documentService } from '../../services/documentService'
import { setDocuments, setPreviewDocument, setLoading, setError } from '../slices/documentSlice'
import { showSuccess, showError } from '../slices/notificationSlice'

// Fetch application documents
export const fetchApplicationDocuments = createAsyncThunk(
  'documents/fetchApplicationDocuments',
  async (applicationId: number, { dispatch }) => {
    try {
      dispatch(setLoading(true))
      const documents = await documentService.getApplicationDocuments(applicationId)
      dispatch(setDocuments(documents))
    } catch (error) {
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
          const base64Data = reader.result as string
          const base64String = base64Data.split(',')[1]
          // This would need the document object to create preview
          resolve()
        }
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      dispatch(showError('Error loading document preview'))
    }
  }
)