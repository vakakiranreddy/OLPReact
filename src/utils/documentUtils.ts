import { documentService } from '../services/documentService'
import type { DocumentResponse } from '../types'

export const downloadDocument = async (doc: DocumentResponse): Promise<void> => {
  try {
    const blob = await documentService.downloadDocument(doc.documentId)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = doc.fileName || doc.documentName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch {
    throw new Error('Error downloading document')
  }
}

export const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64Data = reader.result as string
      const base64String = base64Data.split(',')[1]
      resolve(base64String)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export const isImageFile = (fileType?: string): boolean => {
  return fileType?.startsWith('image/') || false
}

export const isPdfFile = (fileType?: string): boolean => {
  return fileType === 'application/pdf'
}