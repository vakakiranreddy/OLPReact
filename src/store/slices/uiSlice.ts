import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  loading: boolean
  sidebarOpen: boolean
  activeFilter: string
  activeTab: string
  searchTerm: string
  modals: {
    [key: string]: boolean
  }
}

const initialState: UIState = {
  loading: true,
  sidebarOpen: false,
  activeFilter: 'pending',
  activeTab: 'applications',
  searchTerm: '',
  modals: {},
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    
    setActiveFilter: (state, action: PayloadAction<string>) => {
      state.activeFilter = action.payload
    },
    
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload
    },
    
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true
    },
    
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false
    },
    
    closeAllModals: (state) => {
      state.modals = {}
    },
  },
})

export const {
  setLoading,
  setSidebarOpen,
  setActiveFilter,
  setActiveTab,
  setSearchTerm,
  openModal,
  closeModal,
  closeAllModals,
} = uiSlice.actions

export default uiSlice.reducer