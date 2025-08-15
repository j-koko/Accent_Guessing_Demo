import { useState, useEffect, useRef } from 'react'
import { getResponseIdFromUrl } from '../lib/utils'

export const useReportData = () => {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [responseId, setResponseId] = useState('')
  const pollingTimeoutRef = useRef(null)
  const pollingIntervalRef = useRef(null)
  const startTimeRef = useRef(null)

  const fetchReport = async (id, isPolling = false) => {
    try {
      if (!isPolling) {
        setLoading(true)
        setError(null)
      }
      
      const response = await fetch(`/api/report?responseId=${encodeURIComponent(id)}`)
      
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
        setLoading(false)
        
        // Clear polling if data is found
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current)
          pollingTimeoutRef.current = null
        }
        
        return true
      } else if (response.status === 202 || response.status === 404) {
        // Data not found yet (either 202 waiting status or 404 not found), continue waiting
        // Don't set loading to false or show error on initial fetch - let polling handle it
        return false
      } else {
        // Only show error immediately if this is a polling request or a real server error
        if (isPolling) {
          return false
        } else {
          // For initial fetch with server errors, still start polling but don't show error yet
          return false
        }
      }
    } catch (err) {
      // Only show error immediately if this is a polling request
      if (isPolling) {
        return false
      } else {
        // For initial fetch with network errors, still start polling but don't show error yet
        return false
      }
    }
  }

  const startPolling = (id) => {
    startTimeRef.current = Date.now()
    
    // Set up polling interval (every 3 seconds)
    pollingIntervalRef.current = setInterval(async () => {
      const found = await fetchReport(id, true)
      if (found) {
        // Data found, polling will be cleared in fetchReport
        return
      }
      
      // Check if we should show error after 10 seconds
      const elapsed = Date.now() - startTimeRef.current
      if (elapsed >= 10000) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current)
          pollingTimeoutRef.current = null
        }
        setError('No accent data available for this response ID')
        setLoading(false)
      }
    }, 3000)
    
    // Set up timeout (20 seconds as fallback)
    pollingTimeoutRef.current = setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      setError('No accent data available for this response ID')
      setLoading(false)
    }, 20000)
  }

  const refetch = () => {
    if (responseId) {
      // Clear any existing polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current)
        pollingTimeoutRef.current = null
      }
      
      fetchReport(responseId)
    }
  }

  useEffect(() => {
    const id = getResponseIdFromUrl()
    
    if (id) {
      setResponseId(id)
      setLoading(true)
      setError(null)
      
      // Try to fetch immediately
      fetchReport(id).then((found) => {
        if (!found) {
          // If not found, start polling and keep loading state
          startPolling(id)
        }
      })
    } else {
      setError('No responseId provided in URL')
      setLoading(false)
    }

    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current)
      }
    }
  }, [])

  return { reportData, loading, error, refetch, responseId }
}