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
      } else if (response.status === 404 && isPolling) {
        // Data not found yet during polling, continue waiting
        return false
      } else {
        if (!isPolling) {
          setError('Failed to load report')
          setLoading(false)
        }
        return false
      }
    } catch (err) {
      if (!isPolling) {
        setError('Failed to load report')
        setLoading(false)
      }
      return false
    }
  }

  const startPolling = (id) => {
    startTimeRef.current = Date.now()
    
    // Set up polling interval (every 1 second)
    pollingIntervalRef.current = setInterval(async () => {
      const found = await fetchReport(id, true)
      if (found) {
        // Data found, polling will be cleared in fetchReport
        return
      }
    }, 1000)
    
    // Set up timeout (20 seconds)
    pollingTimeoutRef.current = setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      setError('Report data not found. The data may still be processing.')
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
      
      // Try to fetch immediately
      fetchReport(id).then((found) => {
        if (!found) {
          // If not found, start polling
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