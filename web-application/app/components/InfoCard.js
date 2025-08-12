import { Card, CardContent } from './ui/card'

export default function InfoCard({ label, value }) {
  return (
    <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
      <CardContent className="p-3 text-center">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="font-semibold text-foreground text-sm">{value}</p>
      </CardContent>
    </Card>
  )
}