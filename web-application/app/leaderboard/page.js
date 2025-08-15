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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()

  const ITEMS_PER_PAGE = 10

  const fetchLeaderboard = async (page = 1) => {
    try {
      setIsLoading(true)
      
      const offset = (page - 1) * ITEMS_PER_PAGE
      const response = await fetch(`${CONFIG.API.GUESSING_GAME}?limit=${ITEMS_PER_PAGE}&offset=${offset}&orderBy=score&order=desc`)
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data')
      }
      const result = await response.json()
      
      // Handle both old and new API formats
      const data = result.data || result
      const total = result.total || data.length
      const globalStats = result.globalStats
      
      setLeaderboardData(data)
      setTotalPlayers(total)
      setHasMore((page * ITEMS_PER_PAGE) < total)
      
      // Use global stats from API if available, otherwise calculate from current page (fallback)
      if (globalStats) {
        setStats({ 
          totalPlayers: total, 
          averageScore: globalStats.averageScore, 
          highestScore: globalStats.highestScore 
        })
      } else if (data.length > 0) {
        // Fallback for old API format
        const averageScore = Math.round(data.reduce((sum, player) => sum + player.score, 0) / data.length)
        const highestScore = Math.max(...data.map(player => player.score))
        setStats({ totalPlayers: total, averageScore, highestScore })
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

  const goToNextPage = () => {
    if (hasMore) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchLeaderboard(nextPage)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1
      setCurrentPage(prevPage)
      fetchLeaderboard(prevPage)
    }
  }

  const refreshLeaderboard = () => {
    setCurrentPage(1)
    fetchLeaderboard(1)
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
    const globalRank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1
    switch (globalRank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${globalRank}`
    }
  }

  const getScoreColor = (score) => {
    if (score >= 95) return 'text-emerald-700 bg-emerald-100 border-emerald-200'
    if (score >= 85) return 'text-blue-700 bg-blue-100 border-blue-200'
    if (score >= 75) return 'text-purple-700 bg-purple-100 border-purple-200'
    if (score >= 65) return 'text-amber-700 bg-amber-100 border-amber-200'
    return 'text-slate-700 bg-slate-100 border-slate-200'
  }

  const getCardColor = (index) => {
    const globalRank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1
    if (globalRank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 shadow-xl'
    if (globalRank === 2) return 'bg-gradient-to-r from-slate-50 to-gray-50 border-l-4 border-gray-400 shadow-lg'
    if (globalRank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400 shadow-lg'
    return 'bg-white/80 border-l-4 border-blue-200 shadow-md hover:shadow-lg'
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} onRetry={fetchLeaderboard} />

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4 md:mb-6 shadow-lg">
            <span className="text-2xl md:text-3xl">🏆</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-4 tracking-tight">
            <span className="text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text">
              Accent Guessing Champions
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className={`w-3 h-3 rounded-full ${
              error ? 'bg-red-500' : isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse'
            }`}></span>
            <p className="text-sm text-muted-foreground font-medium">
              {error ? '❌ Data Unavailable' : isLoading ? '⏳ Loading...' : 'Live Leaderboard'}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardHeader className="text-center pb-1 md:pb-2">
              <CardTitle className="text-sm md:text-lg flex items-center justify-center gap-1 md:gap-2">
                <span className="text-sm md:text-base"></span> 
                <span className="hidden sm:inline">Total Players</span>
                <span className="sm:hidden">Players</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0 pb-2 md:pb-4">
              <div className="text-lg md:text-4xl font-bold font-mono">
                {totalPlayers}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardHeader className="text-center pb-1 md:pb-2">
              <CardTitle className="text-sm md:text-lg flex items-center justify-center gap-1 md:gap-2">
                <span className="text-sm md:text-base"></span> 
                <span className="hidden sm:inline">Average Score</span>
                <span className="sm:hidden">Avg Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0 pb-2 md:pb-4">
              <div className="text-lg md:text-4xl font-bold font-mono">
                {stats.averageScore}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm mb-8">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg md:text-2xl flex items-center gap-2">
                🏅 Leaderboard
              </CardTitle>
              <button
                onClick={refreshLeaderboard}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 transition-all text-white text-sm md:text-base disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Refreshing</span>
                  </>
                ) : (
                  <>
                    <span>Refresh</span>
                  </>
                )}
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {leaderboardData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-8xl mb-6 animate-bounce">🎯</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-4">Ready to Play?</h3>
                <p className="text-gray-500 mb-6 text-lg">Be the first accent guessing champion!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboardData.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 md:p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${getCardColor(index)}`}
                  >
                    <div className="flex items-center space-x-3 md:space-x-6">
                      <div className={`font-bold min-w-[2rem] md:min-w-[4rem] text-center ${((currentPage - 1) * ITEMS_PER_PAGE + index + 1) <= 3 ? 'text-2xl md:text-4xl lg:text-5xl' : 'text-lg md:text-2xl lg:text-3xl'}`}>
                        {getRankIcon(index)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-base md:text-xl mb-1">
                          {player.name}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                          {formatDate(player.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={`text-sm md:text-xl font-bold px-2 md:px-4 py-1 md:py-2 ${getScoreColor(player.score)}`}
                      >
                        {player.score}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {totalPlayers > ITEMS_PER_PAGE && (
              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <Button 
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="px-3 md:px-4 py-2 text-sm md:text-base"
                >
                  ← Previous
                </Button>
                
                <div className="flex items-center gap-2 text-sm md:text-base text-gray-600">
                  <span>Page {currentPage} of {Math.ceil(totalPlayers / ITEMS_PER_PAGE)}</span>
                </div>
                
                <Button 
                  onClick={goToNextPage}
                  disabled={!hasMore}
                  variant="outline"
                  className="px-3 md:px-4 py-2 text-sm md:text-base"
                >
                  Next →
                </Button>
              </div>
            )}
            
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center">
          <Button 
            onClick={() => router.push('/researchers')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 md:px-12 py-3 md:py-4 text-lg md:text-xl shadow-lg"
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