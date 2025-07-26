'use client'

import { useState, useEffect } from 'react'
import { calculateFrequencies, getResponseIdFromUrl } from '../../lib/utils'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import FrequencyChart from '../components/FrequencyChart'
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

  const questions = Object.keys(userResponses)
    .filter(qKey => qKey.match(/^Q\d+$/))
    .sort((a, b) => {
      const aNum = parseInt(a.replace('Q', ''))
      const bNum = parseInt(b.replace('Q', ''))
      return aNum - bNum
    })

  const questionsData = questions.map(question => {
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

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{
          color: 'var(--color-primary)',
          fontSize: '2.5rem',
          marginBottom: '0.5rem'
        }}>
          Survey Response Report
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem' }}>
          <strong>Response ID:</strong> {responseId}
        </p>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
          Showing how your answers compare to {allResponses.length} total responses
        </p>
      </div>

      {questionsData.length > 0 ? (
        <>
          <div style={{ marginBottom: '3rem' }}>
            {questionsData
              .filter(q => q.hasData && Object.keys(q.frequencies).length > 1)
              .slice(0, 3)
              .map(questionData => (
                <FrequencyChart
                  key={questionData.question}
                  frequencies={questionData.frequencies}
                  userAnswer={questionData.userAnswer}
                  question={questionData.question}
                />
              ))}
          </div>

          <div>
            <h2 style={{ 
              color: 'var(--color-primary)', 
              marginBottom: '1.5rem',
              fontSize: '1.8rem'
            }}>
              All Questions Summary
            </h2>
            <div className="grid">
              {questionsData.map(questionData => (
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
        </>
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