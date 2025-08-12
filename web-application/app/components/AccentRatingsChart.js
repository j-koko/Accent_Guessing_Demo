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
      <div className="bg-white/95 backdrop-blur-sm p-4 border-0 rounded-xl shadow-xl">
        <p className="font-semibold text-foreground mb-3 text-center border-b pb-2">{`${label}`}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium">{entry.name}:</span>
              </div>
              <span 
                className="text-sm font-bold"
                style={{ color: entry.color }}
              >
                {entry.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
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
    <div className={`space-y-8 ${className}`}>
      {/* Trustworthiness Chart */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <span className="text-blue-500">🔒</span>
            Trustworthiness Ratings
          </CardTitle>
          <CardDescription className="text-base">
            How trustworthy do different accents sound? • Scale: 0-5 
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={trustData.data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 80,
              }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis 
                dataKey="accent" 
                tickFormatter={formatAxisLabel}
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={13}
                className="font-medium"
              />
              <YAxis 
                domain={[0, 5]} 
                tickCount={6}
                fontSize={13}
                className="font-medium"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '24px' }}
                iconType="rect"
                className="text-sm"
              />
              <Bar 
                dataKey="participant" 
                fill={CHART_COLORS.participant} 
                name="Your Rating"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="sameL1Avg" 
                fill={CHART_COLORS.sameL1Avg} 
                name="Same L1 Average"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="otherL1Avg" 
                fill={CHART_COLORS.otherL1Avg} 
                name="Other L1 Average"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="voiceL1Avg" 
                fill={CHART_COLORS.voiceL1Avg} 
                name="Voice L1 Average"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pleasantness Chart */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
            <span className="text-green-500">😊</span>
            Pleasantness Ratings
          </CardTitle>
          <CardDescription className="text-base">
            How pleasant do different accents sound? • Scale: 0-5
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={pleasantData.data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 80,
              }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis 
                dataKey="accent" 
                tickFormatter={formatAxisLabel}
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={13}
                className="font-medium"
              />
              <YAxis 
                domain={[0, 5]} 
                tickCount={6}
                fontSize={13}
                className="font-medium"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '24px' }}
                iconType="rect"
                className="text-sm"
              />
              <Bar 
                dataKey="participant" 
                fill={CHART_COLORS.participant} 
                name="Your Rating"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="sameL1Avg" 
                fill={CHART_COLORS.sameL1Avg} 
                name="Same L1 Average"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="otherL1Avg" 
                fill={CHART_COLORS.otherL1Avg} 
                name="Other L1 Average"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="voiceL1Avg" 
                fill={CHART_COLORS.voiceL1Avg} 
                name="Voice L1 Average"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}