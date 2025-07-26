export default function Home() {
  return (
    <div className="container">
      <h1 style={{ 
        color: 'var(--color-primary)', 
        fontSize: '2.5rem', 
        textAlign: 'center',
        marginBottom: '1rem'
      }}>
        Voice Preferences Analytics Dashboard
      </h1>
      <p style={{ 
        textAlign: 'center', 
        color: 'var(--color-muted)', 
        marginBottom: '3rem',
        fontSize: '1.1rem'
      }}>
        Analytics dashboard for voice preference survey data
      </p>
      
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1.5rem', 
        backgroundColor: '#f0f8ff', 
        borderRadius: '8px' 
      }}>
        <h2 style={{ marginBottom: '1rem' }}>View Your Report</h2>
        <p>Visit: <code>/report?responseId=YOUR_RESPONSE_ID</code></p>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginTop: '0.5rem' }}>
          Replace YOUR_RESPONSE_ID with your actual response ID.
        </p>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem' }}>API Endpoints</h2>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--color-success)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            POST /api/responses
          </h3>
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.9rem' }}>
            Submit survey responses from Qualtrics
          </p>
        </div>
        <div>
          <h3 style={{ color: '#f59e0b', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            GET /api/report
          </h3>
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.9rem' }}>
            Get analytics report for a response ID
          </p>
        </div>
      </div>
    </div>
  )
}