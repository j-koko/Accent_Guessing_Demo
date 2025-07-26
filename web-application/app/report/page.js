'use client'

import { useState, useEffect } from 'react'
import { calculateFrequencies, getResponseIdFromUrl } from '../../lib/utils'
import { questionCategories, getAllValidColumns } from '../../lib/voicePreferences'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import QuestionSummary from '../components/QuestionSummary'

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

  const { you: userResponses, allResponses } = reportData

  // Get all available questions and organize by category
  const allQuestions = getAllValidColumns()
  const availableQuestions = Object.keys(userResponses)
    .filter(qKey => allQuestions.includes(qKey))

  // Group questions by category for organized display
  const questionsByCategory = {}
  Object.entries(questionCategories).forEach(([categoryKey, category]) => {
    questionsByCategory[categoryKey] = category.questions
      .filter(q => availableQuestions.includes(q))
      .map(question => {
        const userAnswer = userResponses[question]
        const { frequencies, totalResponses } = calculateFrequencies(allResponses, question)
        
        return {
          question,
          userAnswer,
          frequencies,
          totalResponses,
          hasData: totalResponses > 0
        }
      })
      .filter(q => q.hasData) // Only show questions with data
  })

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{
          color: 'var(--color-primary)',
          fontSize: '2.5rem',
          marginBottom: '0.5rem'
        }}>
          Voice Preferences Survey Report
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem' }}>
          <strong>Response ID:</strong> {responseId}
        </p>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
          Comparing your voice preference ratings with {allResponses.length} total responses
        </p>
      </div>

      {Object.keys(questionsByCategory).some(cat => questionsByCategory[cat].length > 0) ? (
        <div>
          {Object.entries(questionCategories).map(([categoryKey, category]) => {
            const categoryQuestions = questionsByCategory[categoryKey] || []
            if (categoryQuestions.length === 0) return null

            return (
              <div key={categoryKey} style={{ marginBottom: '3rem' }}>
                <h2 style={{ 
                  color: 'var(--color-primary)', 
                  marginBottom: '1.5rem',
                  fontSize: '1.6rem',
                  borderBottom: '2px solid var(--color-primary)',
                  paddingBottom: '0.5rem'
                }}>
                  {category.title}
                </h2>
                
                <div className="grid">
                  {categoryQuestions.map(questionData => (
                    <QuestionSummary
                      key={questionData.question}
                      question={questionData.question}
                      userAnswer={questionData.userAnswer}
                      frequencies={questionData.frequencies}
                      totalResponses={questionData.totalResponses}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: 'var(--color-background)',
          borderRadius: '12px'
        }}>
          <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem' }}>
            No survey responses found.
          </p>
        </div>
      )}
    </div>
  )
}