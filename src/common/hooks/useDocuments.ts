import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { setPreviewDocument } from '../../store/slices/documentSlice'
import { showError } from '../../store/slices/notificationSlice'
import { downloadDocument, convertBlobToBase64 } from '../utils/documentUtils'
import { documentService } from '../../services/documentService'
import type { DocumentResponse } from '../../types'

export const useDocuments = () => {
  const { documents, previewDocument } = useSelector((state: RootState) => state.documents)
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
      const base64String = await convertBlobToBase64(blob)
      const docWithData = { ...doc, fileData: base64String }
      dispatch(setPreviewDocument(docWithData))
    } catch {
      dispatch(showError('Error loading document preview'))
    }
  }

  const hidePreview = () => {
    dispatch(setPreviewDocument(null))
  }

  return {
    documents,
    previewDocument,
    handleDownload,
    handleViewDocument,
    hidePreview
  }
}