import { useState, useEffect, useRef } from 'react'
import { getResponseIdFromUrl } from '../lib/utils'

export const useReportData = () => {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [responseId, setResponseId] = useState('')
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
        
        // Check if we have accent metrics data, if not, treat as "not ready yet"
        if (data.accentMetrics) {
          setReportData(data)
          setLoading(false)
          
          // Clear polling if data is found
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
          
          return true
        } else {
          // Data exists but accentMetrics is not ready, continue polling
          return false
        }
      } else if (response.status === 202 || response.status === 404) {
        // Data not found yet, continue waiting
        return false
      } else {
        // Server error, continue polling to retry
        return false
      }
    } catch (err) {
      // Network error, continue polling to retry
      return false
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
      
      // Check if we should show error after 15 seconds
      const elapsed = Date.now() - startTimeRef.current
      if (elapsed >= 15000) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        setError('No accent data available for this response ID')
        setLoading(false)
      }
    }, 3000)
  }

  const refetch = () => {
    if (responseId) {
      // Clear any existing polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
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
    }
  }, [])

  return { reportData, loading, error, refetch, responseId }
}