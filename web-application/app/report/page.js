'use client'

import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import AccentRatingsChart from '../components/AccentRatingsChart'
import InfoCard from '../components/InfoCard'
import NoDataCard from '../components/NoDataCard'
import { useReportData } from '../../hooks/useReportData'

export default function Report() {
  const { reportData, loading, error, refetch } = useReportData()

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
              <InfoCard 
                label="Native Language" 
                value={accentMetrics.participantL1} 
              />
              <InfoCard 
                label="Total Responses" 
                value={accentMetrics.metadata.totalResponses} 
              />
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
          <NoDataCard />
        )}
      </div>
    </div>
  )
}