'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import ErrorMessage from '../components/ErrorMessage'
import { Button } from '../components/ui/button'
import { useRouter } from 'next/navigation'
import { CONFIG } from '../../lib/config'

export default function Leaderboard() {
  const [allLeaderboardData, setAllLeaderboardData] = useState([])
  const [stats, setStats] = useState({ totalPlayers: 0, averageScore: 0, highestScore: 0 })
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString())
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const router = useRouter()

  const ITEMS_PER_PAGE = 10

  const fetchAllLeaderboard = async (showLoading = false) => {
    try {
      if (showLoading) {
        setIsRefreshing(true)
      }
      
      // Add 5 second delay
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      const response = await fetch(`${CONFIG.API.GUESSING_GAME}?orderBy=score&order=desc&limit=1000`)
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data')
      }
      const result = await response.json()
      
      // Handle both old and new API formats
      const data = result.data || result || []
      const globalStats = result.globalStats
      
      // Ensure data is always an array
      const validData = Array.isArray(data) ? data : []
      
      setAllLeaderboardData(validData)
      setTotalPlayers(validData.length)
      
      // Use global stats from API if available, otherwise calculate from all data
      if (globalStats && typeof globalStats.averageScore === 'number') {
        setStats({ 
          totalPlayers: validData.length, 
          averageScore: Math.round(globalStats.averageScore), 
          highestScore: globalStats.highestScore || 0 
        })
      } else if (validData.length > 0) {
        // Calculate from all data - defensive against invalid scores
        const validScores = validData
          .map(player => player.score)
          .filter(score => typeof score === 'number' && !isNaN(score))
        
        if (validScores.length > 0) {
          const averageScore = Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
          const highestScore = Math.max(...validScores)
          setStats({ totalPlayers: validData.length, averageScore, highestScore })
        } else {
          setStats({ totalPlayers: validData.length, averageScore: 0, highestScore: 0 })
        }
      } else {
        setStats({ totalPlayers: 0, averageScore: 0, highestScore: 0 })
      }
      
      setLastUpdated(new Date().toLocaleTimeString())
      setError(null)
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setError('Unable to load leaderboard data')
    } finally {
      if (showLoading) {
        setIsRefreshing(false)
      }
      setIsInitialLoading(false)
    }
  }

  const goToNextPage = () => {
    const maxPage = Math.ceil(totalPlayers / ITEMS_PER_PAGE)
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const refreshLeaderboard = () => {
    setCurrentPage(1)
    fetchAllLeaderboard(true)
  }

  useEffect(() => {
    fetchAllLeaderboard()
    const interval = setInterval(fetchAllLeaderboard, CONFIG.REFRESH_INTERVALS.LEADERBOARD)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Unknown date'
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid date'
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Date formatting error:', error)
      return 'Invalid date'
    }
  }

  const getRankIcon = (index, pageNum = safePage) => {
    const globalRank = (pageNum - 1) * ITEMS_PER_PAGE + index + 1
    switch (globalRank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${globalRank}`
    }
  }

  const getScoreColor = (score) => {
    const validScore = typeof score === 'number' ? score : 0
    if (validScore >= 95) return 'text-emerald-700 bg-emerald-100 border-emerald-200'
    if (validScore >= 85) return 'text-blue-700 bg-blue-100 border-blue-200'
    if (validScore >= 75) return 'text-purple-700 bg-purple-100 border-purple-200'
    if (validScore >= 65) return 'text-amber-700 bg-amber-100 border-amber-200'
    return 'text-slate-700 bg-slate-100 border-slate-200'
  }

  const getCardColor = (index, pageNum = safePage) => {
    const globalRank = (pageNum - 1) * ITEMS_PER_PAGE + index + 1
    if (globalRank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 shadow-xl'
    if (globalRank === 2) return 'bg-gradient-to-r from-slate-50 to-gray-50 border-l-4 border-gray-400 shadow-lg'
    if (globalRank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400 shadow-lg'
    return 'bg-white/80 border-l-4 border-blue-200 shadow-md hover:shadow-lg'
  }

  if (error) return <ErrorMessage error={error} onRetry={fetchAllLeaderboard} />

  // Show loading screen during initial load
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Leaderboard...</h2>
          <p className="text-gray-600">Please wait while we fetch the latest results</p>
        </div>
      </div>
    )
  }

  // Get current page data
  const maxPage = Math.max(1, Math.ceil(totalPlayers / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, maxPage)
  
  // Reset to page 1 if current page is invalid
  if (currentPage > maxPage && totalPlayers > 0) {
    setCurrentPage(1)
  }
  
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentPageData = allLeaderboardData.slice(startIndex, endIndex)
  const hasMore = endIndex < totalPlayers


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
              error ? 'bg-red-500' : 'bg-green-500 animate-pulse'
            }`}></span>
            <p className="text-sm text-muted-foreground font-medium">
              {error ? '❌ Data Unavailable' : 'Live Leaderboard'}
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
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-md border transition-all text-white text-sm md:text-base ${
                  isRefreshing 
                    ? 'bg-white/5 border-white/20 cursor-not-allowed opacity-75' 
                    : 'bg-white/10 hover:bg-white/20 border-white/30 hover:border-white/50'
                }`}
              >
                {isRefreshing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm">🔄</span>
                    <span>Refresh</span>
                  </>
                )}
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {allLeaderboardData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-8xl mb-6 animate-bounce">🎯</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-4">Ready to Play?</h3>
                <p className="text-gray-500 mb-6 text-lg">Be the first accent guessing champion!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentPageData.map((player, index) => (
                  <div
                    key={player.id || index}
                    className={`flex items-center justify-between p-3 md:p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${getCardColor(index)}`}
                  >
                    <div className="flex items-center space-x-3 md:space-x-6">
                      <div className={`font-bold min-w-[2rem] md:min-w-[4rem] text-center ${((safePage - 1) * ITEMS_PER_PAGE + index + 1) <= 3 ? 'text-2xl md:text-4xl lg:text-5xl' : 'text-lg md:text-2xl lg:text-3xl'}`}>
                        {getRankIcon(index)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-base md:text-xl mb-1">
                          {player.name || 'Anonymous'}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                          {player.created_at ? formatDate(player.created_at) : 'Unknown date'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={`text-sm md:text-xl font-bold px-2 md:px-4 py-1 md:py-2 ${getScoreColor(player.score || 0)}`}
                      >
                        {typeof player.score === 'number' ? player.score : 0}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {(totalPlayers > ITEMS_PER_PAGE || allLeaderboardData.length > ITEMS_PER_PAGE) && (
              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <Button 
                  onClick={goToPrevPage}
                  disabled={safePage === 1}
                  variant="outline"
                  className="px-3 md:px-4 py-2 text-sm md:text-base"
                >
                  ← Previous
                </Button>
                
                <div className="flex items-center gap-2 text-sm md:text-base text-gray-600">
                  <span>Page {safePage} of {maxPage}</span>
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