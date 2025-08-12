import { Card, CardContent } from './ui/card'

export default function NoDataCard() {
  return (
    <Card className="max-w-2xl mx-auto border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardContent className="p-12 text-center">
        <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
        <p className="text-muted-foreground">
          No accent ratings data is available for this response ID. Please verify the ID and try again.
        </p>
      </CardContent>
    </Card>
  )
}