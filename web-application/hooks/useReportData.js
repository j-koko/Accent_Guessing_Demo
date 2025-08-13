import { useState, useEffect } from 'react'
import { getResponseIdFromUrl } from '../lib/utils'

export const useReportData = () => {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [responseId, setResponseId] = useState('')

  const fetchReport = async (id) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/report?responseId=${encodeURIComponent(id)}`)
      
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        setError('Failed to load report')
      }
    } catch (err) {
      setError('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    if (responseId) {
      fetchReport(responseId)
    }
  }

  useEffect(() => {
    const id = getResponseIdFromUrl()
    
    if (id) {
      setResponseId(id)
      fetchReport(id)
    } else {
      setError('No responseId provided in URL')
      setLoading(false)
    }
  }, [])

  return { reportData, loading, error, refetch, responseId }
}