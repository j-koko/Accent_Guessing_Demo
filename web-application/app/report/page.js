'use client'

import { useState, useEffect } from 'react'
import { getResponseIdFromUrl } from '../../lib/utils'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import AccentRatingsChart from '../components/AccentRatingsChart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6 tracking-tight">
            Voice Accent Ratings
            <span className="block text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
              Analysis Report
            </span>
          </h1>
          
          {/* Participant Information Cards */}
          {accentMetrics && (
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-6">
              <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Native Language</p>
                  <p className="font-semibold text-foreground text-sm">{accentMetrics.participantL1}</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Responses</p>
                  <p className="font-semibold text-foreground text-sm">{accentMetrics.metadata.totalResponses}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Charts Section */}
        {accentMetrics ? (
          <div className="space-y-8">
            <AccentRatingsChart
              trustData={accentMetrics.trustData}
              pleasantData={accentMetrics.pleasantData}
              participantL1={accentMetrics.participantL1}
              className="max-w-6xl mx-auto"
            />
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">
                No accent ratings data is available for this response ID. Please verify the ID and try again.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}