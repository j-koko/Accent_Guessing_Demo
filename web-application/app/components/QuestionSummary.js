export default function QuestionSummary({ question, userAnswer, frequencies, totalResponses }) {
  const userChoiceCount = frequencies[userAnswer] || 0
  const percentage = totalResponses > 0 ? Math.round((userChoiceCount / totalResponses) * 100) : 0

  return (
    <div className="card">
      <h3 style={{ 
        color: 'var(--color-primary)', 
        marginBottom: '1rem',
        fontSize: '1.1rem'
      }}>
        {question}
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
            {userAnswer || 'No response'}
          </span>
        </div>
        
        {userAnswer && userChoiceCount > 0 && (
          <div>
            <strong style={{ color: 'var(--color-muted)' }}>Others with same answer:</strong>
            <span style={{ marginLeft: '0.5rem', color: 'var(--color-primary)' }}>
              {userChoiceCount} ({percentage}% of {totalResponses} responses)
            </span>
          </div>
        )}
      </div>

      {Object.keys(frequencies).length > 1 && (
        <div>
          <h4 style={{ 
            color: 'var(--color-muted)', 
            marginBottom: '0.5rem',
            fontSize: '1rem'
          }}>
            All Responses:
          </h4>
          <div style={{ fontSize: '0.9rem' }}>
            {Object.entries(frequencies)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([answer, count]) => (
                <div 
                  key={answer} 
                  style={{ 
                    padding: '0.25rem 0',
                    color: answer === userAnswer ? 'var(--color-success)' : 'var(--color-muted)',
                    fontWeight: answer === userAnswer ? 'bold' : 'normal'
                  }}
                >
                  {answer === userAnswer ? '→ ' : '• '}
                  {answer}: {count} response{count !== 1 ? 's' : ''}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}