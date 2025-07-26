export default function ErrorMessage({ error, onRetry }) {
  return (
    <div style={{ 
      padding: '3rem', 
      textAlign: 'center',
      backgroundColor: '#fef2f2',
      borderRadius: '12px',
      margin: '2rem auto',
      maxWidth: '500px'
    }}>
      <h2 style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>Error</h2>
      <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>{error}</p>
      {onRetry && (
        <button onClick={onRetry} className="button">
          Try Again
        </button>
      )}
    </div>
  )
}