import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 tracking-tight">
            Voice Preferences
            <span className="block text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
              Analytics Dashboard
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Comprehensive analytics dashboard for voice preference survey data and accent perception research
          </p>
        </div>
        
        {/* Quick Access Card */}
        <Card className="mb-8 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              View Your Report
            </CardTitle>
            <CardDescription className="text-base">
              Access your personalized accent ratings analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-2">URL Format:</p>
              <code className="block bg-white px-3 py-2 rounded border text-sm font-mono text-primary break-all">
                /report?responseId=YOUR_RESPONSE_ID
              </code>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Replace <strong>YOUR_RESPONSE_ID</strong> with your actual response identifier
            </p>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">API Endpoints</CardTitle>
            <CardDescription>
              Developer reference for integrating with our analytics platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* POST Endpoint */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  POST
                </Badge>
                <code className="text-lg font-mono font-semibold">/api/responses</code>
              </div>
              <p className="text-muted-foreground pl-16">
                Submit survey responses from Qualtrics platform for analysis and storage
              </p>
            </div>

            {/* GET Endpoint */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  GET
                </Badge>
                <code className="text-lg font-mono font-semibold">/api/report</code>
              </div>
              <p className="text-muted-foreground pl-16">
                Retrieve comprehensive analytics report for a specific response ID
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}