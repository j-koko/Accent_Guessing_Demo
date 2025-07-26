import { getQuestionLabel, formatRatingValue, isRatingQuestion } from '../../lib/voicePreferences'

export default function QuestionSummary({ question, userAnswer, frequencies, totalResponses }) {
  const userChoiceCount = frequencies[userAnswer] || 0
  const percentage = totalResponses > 0 ? Math.round((userChoiceCount / totalResponses) * 100) : 0
  const displayLabel = getQuestionLabel(question)
  const isRating = isRatingQuestion(question)

  return (
    <div className="card">
      <h3 style={{ 
        color: 'var(--color-primary)', 
        marginBottom: '1rem',
        fontSize: '1rem'
      }}>
        {displayLabel}
      </h3>
      
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--color-background)',
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong style={{ color: 'var(--color-primary)' }}>Your Answer:</strong>
          <span style={{ 
            marginLeft: '0.5rem', 
            color: 'var(--color-success)',
            fontWeight: 'bold'
          }}>
            {isRating && userAnswer ? formatRatingValue(userAnswer) : (userAnswer || 'No response')}
          </span>
        </div>
        
        {userAnswer && userChoiceCount > 0 && (
          <div style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>
            {userChoiceCount} others ({percentage}%) gave the same answer
          </div>
        )}
      </div>
    </div>
  )
}