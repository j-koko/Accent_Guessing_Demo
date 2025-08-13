import './globals.css'

export const metadata = {
  title: 'Voice Preferences Analytics Dashboard',
  description: 'Comprehensive analytics dashboard for voice preference survey data and accent perception research',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <div className="min-h-screen">
          <main role="main" aria-label="Voice Preferences Analytics Dashboard">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}