export default function LoadingSpinner() {
  return (
    <div style={{ 
      padding: '4rem', 
      textAlign: 'center',
      backgroundColor: 'var(--color-background)',
      borderRadius: '12px',
      margin: '2rem auto',
      maxWidth: '400px'
    }}>
      <div className="loading-spinner" />
      <h2 style={{ color: 'var(--color-primary)' }}>Loading...</h2>
    </div>
  )
}