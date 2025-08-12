"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

const CHART_COLORS = {
  participant: '#2563eb',      // Blue - primary accent
  sameL1Avg: '#10b981',       // Green - success color
  otherL1Avg: '#f59e0b',      // Orange - warning color
  voiceL1Avg: '#8b5cf6'       // Purple - secondary accent
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border border-border rounded-lg shadow-lg">
        <p className="font-medium text-foreground mb-2">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value.toFixed(2)}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const formatAxisLabel = (tickItem) => {
  // Shorten long accent names for mobile
  const shortNames = {
    'Mandarin Chinese': 'Mandarin',
    'Polish': 'Polish',
    'Dutch': 'Dutch', 
    'English': 'English'
  }
  return shortNames[tickItem] || tickItem
}

export default function AccentRatingsChart({ 
  trustData, 
  pleasantData, 
  participantL1,
  className = "" 
}) {
  if (!trustData || !pleasantData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Accent Ratings</CardTitle>
          <CardDescription>No accent ratings data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Trustworthiness Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-primary">Trustworthiness Ratings</CardTitle>
          <CardDescription>
            Participant: {participantL1} • Rating scale: 0-5
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={trustData.data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
              barCategoryGap="15%"
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="accent" 
                tickFormatter={formatAxisLabel}
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                domain={[0, 5]} 
                tickCount={6}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Bar 
                dataKey="participant" 
                fill={CHART_COLORS.participant} 
                name="Your Rating"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="sameL1Avg" 
                fill={CHART_COLORS.sameL1Avg} 
                name="Same L1 Average"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="otherL1Avg" 
                fill={CHART_COLORS.otherL1Avg} 
                name="Other L1 Average"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="voiceL1Avg" 
                fill={CHART_COLORS.voiceL1Avg} 
                name="Voice L1 Average"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pleasantness Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-primary">Pleasantness Ratings</CardTitle>
          <CardDescription>
            Participant: {participantL1} • Rating scale: 0-5
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={pleasantData.data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
              barCategoryGap="15%"
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="accent" 
                tickFormatter={formatAxisLabel}
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                domain={[0, 5]} 
                tickCount={6}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Bar 
                dataKey="participant" 
                fill={CHART_COLORS.participant} 
                name="Your Rating"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="sameL1Avg" 
                fill={CHART_COLORS.sameL1Avg} 
                name="Same L1 Average"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="otherL1Avg" 
                fill={CHART_COLORS.otherL1Avg} 
                name="Other L1 Average"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="voiceL1Avg" 
                fill={CHART_COLORS.voiceL1Avg} 
                name="Voice L1 Average"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}