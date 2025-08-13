import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

export default function ErrorMessage({ error, onRetry }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <CardTitle className="text-xl text-destructive">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground leading-relaxed">{error}</p>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2"
            >
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}