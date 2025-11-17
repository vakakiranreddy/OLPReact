import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { DocumentResponse } from '../../../types'

interface DocumentState {
  documents: DocumentResponse[]
  previewDocument: DocumentResponse | null
  loading: boolean
  error: string | null
}

const initialState: DocumentState = {
  documents: [],
  previewDocument: null,
  loading: false,
  error: null,
}

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    setDocuments: (state, action: PayloadAction<DocumentResponse[]>) => {
      state.documents = action.payload
      state.loading = false
      state.error = null
    },
    
    addDocument: (state, action: PayloadAction<DocumentResponse>) => {
      state.documents.push(action.payload)
    },
    
    removeDocument: (state, action: PayloadAction<number>) => {
      state.documents = state.documents.filter((doc: DocumentResponse) => doc.documentId !== action.payload)
    },
    
    setPreviewDocument: (state, action: PayloadAction<DocumentResponse | null>) => {
      state.previewDocument = action.payload
    },
    
    clearDocuments: (state) => {
      state.documents = []
      state.previewDocument = null
    },
  },
})

export const {
  setLoading,
  setError,
  setDocuments,
  addDocument,
  removeDocument,
  setPreviewDocument,
  clearDocuments,
} = documentSlice.actions

export default documentSlice.reducer