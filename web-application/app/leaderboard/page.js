'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { Button } from '../components/ui/button'
import { useRouter } from 'next/navigation'
import { CONFIG } from '../../lib/config'

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([])
  const [stats, setStats] = useState({ totalPlayers: 0, averageScore: 0, highestScore: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState('Loading...')
  const router = useRouter()

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${CONFIG.API.GUESSING_GAME}?limit=${CONFIG.UI.LEADERBOARD_DEFAULT_LIMIT}&orderBy=score&order=desc`)
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data')
      }
      const data = await response.json()
      
      setLeaderboardData(data)
      
      // Calculate stats
      if (data.length > 0) {
        const totalPlayers = data.length
        const averageScore = Math.round(data.reduce((sum, player) => sum + player.score, 0) / totalPlayers)
        const highestScore = Math.max(...data.map(player => player.score))
        setStats({ totalPlayers, averageScore, highestScore })
      }
      
      setLastUpdated(new Date().toLocaleTimeString())
      setError(null)
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setError('Unable to load leaderboard data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, CONFIG.REFRESH_INTERVALS.LEADERBOARD)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return '🥇'
      case 1: return '🥈'
      case 2: return '🥉'
      default: return `#${index + 1}`
    }
  }

  const getScoreColor = (score) => {
    if (score >= 95) return 'text-emerald-600 bg-emerald-100 border-emerald-300'
    if (score >= 85) return 'text-blue-600 bg-blue-100 border-blue-300'
    if (score >= 75) return 'text-purple-600 bg-purple-100 border-purple-300'
    if (score >= 65) return 'text-orange-600 bg-orange-100 border-orange-300'
    return 'text-red-600 bg-red-100 border-red-300'
  }

  const getCardColor = (index) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 shadow-xl'
    if (index === 1) return 'bg-gradient-to-r from-slate-50 to-gray-50 border-l-4 border-gray-400 shadow-lg'
    if (index === 2) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400 shadow-lg'
    return 'bg-white/80 border-l-4 border-blue-200 shadow-md hover:shadow-lg'
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} onRetry={fetchLeaderboard} />

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <span className="text-3xl">🏆</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 tracking-tight">
            <span className="text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text">
              Accent Guessing Champions
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            🎯 Master the art of accent recognition
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className={`w-3 h-3 rounded-full ${
              error ? 'bg-red-500' : isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse'
            }`}></span>
            <p className="text-sm text-muted-foreground font-medium">
              {error ? '❌ Data Unavailable' : isLoading ? '⏳ Loading...' : '🔴 Live Leaderboard'}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <span>👥</span> Total Players
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl font-bold mb-2 font-mono">
                {stats.totalPlayers}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <span>📊</span> Average Score
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl font-bold mb-2 font-mono">
                {stats.averageScore}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <span>🎯</span> High Score
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl font-bold mb-2 font-mono">
                {stats.highestScore}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm mb-8">
          <CardHeader className="text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              🏅 Top Players
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {leaderboardData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-8xl mb-6 animate-bounce">🎯</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-4">Ready to Play?</h3>
                <p className="text-gray-500 mb-6 text-lg">Be the first accent guessing champion!</p>
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-lg">
                  🚀 Start Playing
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboardData.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${getCardColor(index)}`}
                  >
                    <div className="flex items-center space-x-6">
                      <div className={`font-bold min-w-[4rem] text-center ${index < 3 ? 'text-5xl' : 'text-3xl'}`}>
                        {getRankIcon(index)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-xl mb-1">
                          {player.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span>📅</span>
                          {formatDate(player.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={`text-xl font-bold px-4 py-2 ${getScoreColor(player.score)}`}
                      >
                        🎯 {player.score}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Button 
            onClick={() => router.push('/')}
            variant="outline"
            className="px-8 py-3 text-lg border-indigo-300 hover:bg-indigo-50 hover:border-indigo-400"
          >
            📊 Dashboard
          </Button>
          <Button 
            onClick={() => router.push('/researchers')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-lg"
          >
            🔬 Research Team
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            🔄 Last updated: {lastUpdated}
          </p>
        </div>
      </div>
    </div>
  )
}