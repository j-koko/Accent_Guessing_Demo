import './globals.css'

export const metadata = {
  title: 'QualMetrics Dashboard',
  description: 'Survey analytics for Qualtrics data',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{ minHeight: '100vh' }}>
          {children}
        </div>
      </body>
    </html>
  )
}