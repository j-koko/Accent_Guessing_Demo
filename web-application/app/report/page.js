'use client'

import { useState, useEffect } from 'react'
import { getResponseIdFromUrl } from '../../lib/utils'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import AccentRatingsChart from '../components/AccentRatingsChart'

export default function Report() {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [responseId, setResponseId] = useState('')

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

  const fetchReport = async (id) => {
    try {
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
      setLoading(true)
      setError(null)
      fetchReport(responseId)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} onRetry={refetch} />
  if (!reportData) return <div>No data</div>

  const { accentMetrics } = reportData

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Voice Accent Ratings Report
          </h1>
          <div className="space-y-2">
            <p className="text-lg text-muted-foreground">
              <span className="font-medium">Response ID:</span> {responseId}
            </p>
            {accentMetrics && (
              <>
                <p className="text-muted-foreground">
                  <span className="font-medium">Your Native Language:</span> {accentMetrics.participantL1}
                </p>
                <p className="text-sm text-muted-foreground">
                  Comparing your ratings with {accentMetrics.metadata.totalResponses} total responses
                </p>
              </>
            )}
          </div>
        </div>

        {/* Accent Ratings Charts */}
        {accentMetrics ? (
          <AccentRatingsChart
            trustData={accentMetrics.trustData}
            pleasantData={accentMetrics.pleasantData}
            participantL1={accentMetrics.participantL1}
            className="max-w-5xl mx-auto"
          />
        ) : (
          <div className="text-center p-8">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <p className="text-muted-foreground text-lg">
                No accent ratings data available for this response.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}