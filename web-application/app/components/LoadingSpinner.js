import { Card, CardContent } from './ui/card'

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">Loading Analysis</h2>
          <p className="text-muted-foreground">Processing your accent ratings data...</p>
        </CardContent>
      </Card>
    </div>
  )
}