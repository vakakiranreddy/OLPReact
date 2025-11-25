import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { showError, showSuccess } from '../app/store/slices/notificationSlice'
import { downloadDocument } from '../utils/documentUtils'
import { documentService } from '../services/documentService'
import type { DocumentResponse } from '../types'

export const useDocuments = () => {
  const [previewDoc, setPreviewDoc] = useState<DocumentResponse | null>(null)
  const dispatch = useDispatch()

  const handleDownload = async (doc: DocumentResponse) => {
    try {
      await downloadDocument(doc)
    } catch {
      dispatch(showError('Error downloading document'))
    }
  }

  const handleViewDocument = async (doc: DocumentResponse) => {
    try {
      const blob = await documentService.downloadDocument(doc.documentId)
      const reader = new FileReader()
      reader.onload = () => {
        const base64Data = reader.result as string
        const base64String = base64Data.split(',')[1]
        const docWithData = { ...doc, fileData: base64String }
        setPreviewDoc(docWithData)
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Error loading document for preview:', error)
      dispatch(showError('Error loading document preview'))
    }
  }

  const hidePreview = () => {
    setPreviewDoc(null)
  }

  const handleRemoveDocument = async (requiredDocumentId: number, documentId: number, setUploadedDocs: React.Dispatch<React.SetStateAction<{[key: number]: DocumentResponse}>>) => {
    try {
      if (!documentId) {
        dispatch(showError('Invalid document ID'))
        return
      }
      await documentService.deleteDocument(documentId)
      setUploadedDocs(prev => {
        const newDocs = {...prev}
        delete newDocs[requiredDocumentId]
        return newDocs
      })
      setPreviewDoc(null)
      dispatch(showSuccess('Document removed successfully!'))
    } catch (error) {
      console.error('Error removing document:', error)
      dispatch(showError('Error removing document. Please try again.'))
    }
  }

  return {
    previewDoc,
    handleDownload,
    handleViewDocument,
    hidePreview,
    handleRemoveDocument
  }
}