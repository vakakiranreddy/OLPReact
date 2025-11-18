import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { useEffect, useMemo } from 'react'
import { RootState } from '../app/store'
import { setActiveFilter, setActiveTab } from '../app/store/slices/uiSlice'
import { filterApplicationsByStatus, searchApplications } from '../utils/applicationUtils'

export const useApplications = () => {
  const { applications, selectedApplication, statistics } = useSelector((state: RootState) => state.applications)
  const { activeFilter, activeTab, searchTerm } = useSelector((state: RootState) => state.ui)
  const dispatch = useDispatch()
  const location = useLocation()

 
  useEffect(() => {
    const path = location.pathname
    if (path.includes('/statistics')) {
      dispatch(setActiveTab('statistics'))
    } else if (path.includes('/reviewers')) {
      dispatch(setActiveTab('reviewers'))
    } else {
      dispatch(setActiveTab('applications'))
      
      
      if (path.includes('/approved')) {
        dispatch(setActiveFilter('approved'))
      } else if (path.includes('/need-approval')) {
        dispatch(setActiveFilter('needApproval'))
      } else if (path.includes('/under-review')) {
        dispatch(setActiveFilter('underReview'))
      } else if (path.includes('/rejected')) {
        dispatch(setActiveFilter('rejected'))
      } else {
        dispatch(setActiveFilter('pending'))
      }
    }
  }, [location.pathname, dispatch])

  
  const filteredApplications = useMemo(() => {
    const statusFiltered = filterApplicationsByStatus(applications, activeFilter)
    return searchApplications(statusFiltered, searchTerm)
  }, [applications, activeFilter, searchTerm])

  return {
    applications,
    filteredApplications,
    selectedApplication,
    statistics,
    activeFilter,
    activeTab,
    searchTerm
  }
}