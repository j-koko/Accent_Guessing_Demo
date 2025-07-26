'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function FrequencyChart({ frequencies, userAnswer, question }) {
  if (!frequencies || Object.keys(frequencies).length === 0) return null

  const chartData = Object.entries(frequencies)
    .map(([answer, count]) => ({
      answer: answer.length > 15 ? answer.substring(0, 15) + '...' : answer,
      fullAnswer: answer,
      count,
      isUserChoice: answer === userAnswer
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ 
        color: 'var(--color-primary)', 
        marginBottom: '1rem',
        fontSize: '1.2rem'
      }}>
        {question} - Response Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-muted)" opacity={0.3} />
          <XAxis dataKey="answer" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={entry.isUserChoice ? 'var(--color-success)' : 'var(--color-primary)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}