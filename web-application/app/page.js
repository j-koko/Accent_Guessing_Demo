'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { createClient } from '@supabase/supabase-js'
import { CONFIG } from '../lib/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const researchers = [
  {
    name: "Igor Marchenko",
    image: "igor.webp"
  },
  {
    name: "Jan Kokowski", 
    image: "jan.webp"
  },
  {
    name: "Stella S.",
    image: "stella.webp"
  }
]

export default function Home() {
  const [stats, setStats] = useState({
    participants: 0,
    nationalities: 0,
    languages: [],
    lastUpdated: 'Loading...'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [imageUrls, setImageUrls] = useState({})
  const [pageImages, setPageImages] = useState({})
  const [qrCodeUrl, setQrCodeUrl] = useState(null)
  const [stableLanguages, setStableLanguages] = useState(new Map()) // Track languages with stable positions
  const [leaderboardData, setLeaderboardData] = useState([])
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [leaderboardError, setLeaderboardError] = useState(null)

  const fetchStats = async () => {
    try {
      const response = await fetch(CONFIG.API.STATS)
      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }
      const data = await response.json()
      setStats({
        participants: data.participants,
        nationalities: data.nationalities,
        languages: data.languages || [],
        lastUpdated: new Date(data.lastUpdated).toLocaleTimeString()
      })
      setError(null)
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError('Unable to load live statistics')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${CONFIG.API.GUESSING_GAME}?limit=10&orderBy=score&order=desc`)
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data')
      }
      const result = await response.json()
      setLeaderboardData(result.data || result)
      setTotalPlayers(result.total || (result.data ? result.data.length : result.length))
      setLeaderboardError(null)
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setLeaderboardError('Unable to load leaderboard data')
    }
  }

  useEffect(() => {
    fetchStats()
    fetchLeaderboard()
    const statsInterval = setInterval(fetchStats, CONFIG.REFRESH_INTERVALS.STATS_DASHBOARD)
    const leaderboardInterval = setInterval(fetchLeaderboard, CONFIG.REFRESH_INTERVALS.LEADERBOARD)
    return () => {
      clearInterval(statsInterval)
      clearInterval(leaderboardInterval)
    }
  }, [])

  useEffect(() => {
    const getImageUrls = async () => {
      const urls = {}
      
      for (const researcher of researchers) {
        try {
          const { data } = supabase.storage
            .from('researcher-images')
            .getPublicUrl(researcher.image)
          
          urls[researcher.image] = data.publicUrl
        } catch (error) {
          console.error(`Error getting URL for ${researcher.image}:`, error)
          urls[researcher.image] = null
        }
      }
      
      setImageUrls(urls)
    }

    getImageUrls()
  }, [])

  useEffect(() => {
    const getPageImages = async () => {
      const images = {}
      const pageNumbers = [1, 2, 3, 4, 5, 6, 7, 8] // All 8 pages
      
      for (const pageNum of pageNumbers) {
        try {
          const { data } = supabase.storage
            .from('researcher-images')
            .getPublicUrl(`page${pageNum}.webp`)
          
          console.log(`Page ${pageNum} URL:`, data.publicUrl)
          images[pageNum] = data.publicUrl
        } catch (error) {
          console.error(`Error getting URL for page${pageNum}.webp:`, error)
          images[pageNum] = null
        }
      }
      
      console.log('All page images:', images)
      setPageImages(images)
    }

    getPageImages()
  }, [])

  useEffect(() => {
    const getQrCodeUrl = () => {
      try {
        // Use local public file
        const qrCodeUrl = '/qrcode.png'
        
        console.log('QR Code URL:', qrCodeUrl)
        setQrCodeUrl(qrCodeUrl)
      } catch (error) {
        console.error('Error getting QR code URL:', error)
        setQrCodeUrl(null)
      }
    }

    getQrCodeUrl()
  }, [])

  // Manage stable language positions to prevent animation restarts
  useEffect(() => {
    if (stats.languages && stats.languages.length > 0) {
      setStableLanguages(prevStable => {
        const newStableMap = new Map(prevStable)
        const usedVerticalSlots = new Set()
        
        // First, preserve existing languages with their positions
        stats.languages.forEach(language => {
          const cleanLanguage = language.replace('Other: ', '')
          if (newStableMap.has(cleanLanguage)) {
            const existing = newStableMap.get(cleanLanguage)
            usedVerticalSlots.add(existing.verticalSlot)
          }
        })
        
        // Then assign positions to new languages
        let nextAvailableSlot = 0
        stats.languages.forEach((language, globalIndex) => {
          const cleanLanguage = language.replace('Other: ', '')
          
          if (!newStableMap.has(cleanLanguage)) {
            // Find next available vertical slot
            while (usedVerticalSlots.has(nextAvailableSlot)) {
              nextAvailableSlot++
            }
            
            // Calculate stable values for new language
            const verticalSlot = nextAvailableSlot
            const stableTop = 20 + (verticalSlot % 8) * 9 // 8 slots, 9% spacing: 20%, 29%, 38%, 47%, 56%, 65%, 74%, 83%
            const stableDuration = 20 + (globalIndex % 3) * 2 // 20-26 seconds (even shorter for more simultaneous languages)
            const stableDelay = globalIndex * 1.2 + (verticalSlot * 0.8) // Very short delays: ~1-2 seconds between starts
            const stableSize = 0.8 + ((globalIndex % 3) * 0.1)
            
            newStableMap.set(cleanLanguage, {
              verticalSlot,
              stableTop,
              stableDuration,
              stableDelay,
              stableSize,
              startTime: Date.now() // Track when this language was added
            })
            
            usedVerticalSlots.add(nextAvailableSlot)
            nextAvailableSlot++
          }
        })
        
        // Remove languages that are no longer in the data
        const currentLanguageNames = new Set(stats.languages.map(lang => lang.replace('Other: ', '')))
        for (const [langName] of newStableMap) {
          if (!currentLanguageNames.has(langName)) {
            newStableMap.delete(langName)
          }
        }
        
        return newStableMap
      })
    }
  }, [stats.languages])

  // Auto-flip pages every 5 seconds with smooth transitions
  useEffect(() => {
    const autoFlip = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % 6) // 6 states: cover, spread1, spread2, spread3, spread4, cover
    }, CONFIG.REFRESH_INTERVALS.PAGE_FLIP)

    return () => clearInterval(autoFlip)
  }, [])

  // Helper functions for leaderboard
  const getRankIcon = (index) => {
    switch (index) {
      case 0: return '🥇'
      case 1: return '🥈'
      case 2: return '🥉'
      default: return `#${index + 1}`
    }
  }

  const getScoreColor = (score) => {
    if (score >= 95) return 'text-emerald-700 bg-emerald-100 border-emerald-200'
    if (score >= 85) return 'text-blue-700 bg-blue-100 border-blue-200'
    if (score >= 75) return 'text-purple-700 bg-purple-100 border-purple-200'
    if (score >= 65) return 'text-amber-700 bg-amber-100 border-amber-200'
    return 'text-slate-700 bg-slate-100 border-slate-200'
  }

  const bookStates = [
    { type: 'cover', isOpen: false },
    { type: 'spread', leftPage: 1, rightPage: 2, isOpen: true },
    { type: 'spread', leftPage: 3, rightPage: 4, isOpen: true },
    { type: 'spread', leftPage: 5, rightPage: 6, isOpen: true },
    { type: 'spread', leftPage: 7, rightPage: 8, isOpen: true },
    { type: 'cover', isOpen: false }
  ]

  return (
    <>
      <style jsx>{`
        .book-container {
          perspective: 1500px;
          perspective-origin: center center;
          min-width: 320px;
          min-height: 208px;
        }
        
        .book-cover {
          transform-style: preserve-3d;
          transition: all 0.8s ease-in-out;
        }
        
        .book-spread {
          transform-style: preserve-3d;
        }
        
        .book-page-left {
          transform-style: preserve-3d;
          transform-origin: right center;
          will-change: transform;
          transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .book-page-right {
          transform-style: preserve-3d;
          transform-origin: left center;
          will-change: transform;
          transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .page-transition-enter {
          opacity: 0;
          transform: scale(0.95);
        }
        
        .page-transition-enter-active {
          opacity: 1;
          transform: scale(1);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .page-transition-exit {
          opacity: 1;
          transform: scale(1);
        }
        
        .page-transition-exit-active {
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 0.4s ease-in, transform 0.4s ease-in;
        }
        
        .language-flow {
          animation: flowRightToLeft linear infinite;
          white-space: nowrap;
        }
        
        @keyframes flowRightToLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100vw);
          }
        }
        
        .viewport-adaptive {
          height: clamp(300px, 100vh - 200px, 800px);
        }
        
        .full-screen-flex {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-height: 100vh;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 min-h-screen max-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-4xl font-bold text-primary mb-2 tracking-tight">
            Accent Perception
            <span className="block text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl sm:text-2xl lg:text-3xl xl:text-4xl">
              Research Dashboard
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              error ? 'bg-red-500' : isLoading ? 'bg-yellow-500' : 'bg-green-500'
            }`}></span>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {error ? 'Stats Unavailable' : isLoading ? 'Loading...' : 'Live Statistics'}
            </p>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-4 sm:gap-6 flex-grow overflow-hidden">
          {/* Left Side - Stats and Research Section */}
          <div className="col-span-12 lg:col-span-9 flex flex-col space-y-4">
            {/* Top Row - Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Participants Card */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-sm sm:text-base text-gray-700">Survey Participants</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-1 font-mono">
                    {isLoading ? '---' : stats.participants}
                  </div>
                  {error && (
                    <p className="text-xs text-red-500 mt-1">Real-time data unavailable</p>
                  )}
                </CardContent>
              </Card>

              {/* Languages Card */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm relative overflow-hidden">
                {/* Language Background Flow */}
                {stableLanguages.size > 0 && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from(stableLanguages.entries()).map(([cleanLanguage, config]) => {
                      return (
                        <div
                          key={`stable-lang-${cleanLanguage}`}
                          className="absolute language-flow text-indigo-600 font-medium select-none whitespace-nowrap"
                          style={{
                            top: `${config.stableTop}%`,
                            left: 'calc(100% + 50px)',
                            opacity: 0.3,
                            fontSize: `${config.stableSize * 0.8}rem`,
                            animationDuration: `${config.stableDuration}s`,
                            animationDelay: `${config.stableDelay}s`,
                            animationIterationCount: 'infinite'
                          }}
                        >
                          {cleanLanguage}
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <CardHeader className="text-center pb-2 relative z-10">
                  <CardTitle className="text-sm sm:text-base text-gray-700">Languages Represented</CardTitle>
                </CardHeader>
                <CardContent className="text-center relative z-10">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-indigo-600 mb-1 font-mono">
                    {isLoading ? '---' : stats.nationalities}
                  </div>
                  {error && (
                    <p className="text-xs text-red-500 mt-1">Real-time data unavailable</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Research Section */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm flex-grow overflow-hidden">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-base sm:text-lg lg:text-xl text-gray-700 font-semibold">Research Team & Paper</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center h-full overflow-hidden relative">
                {/* Research Team Avatars - Moved lower with more space */}
                <div className="flex justify-center space-x-4 sm:space-x-6 mt-6">
                  {researchers.map((researcher, index) => (
                    <div key={index} className="text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-2 border-white shadow-lg bg-gray-100 mx-auto mb-2">
                        {imageUrls[researcher.image] ? (
                          <img 
                            src={imageUrls[researcher.image]}
                            alt={researcher.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 animate-pulse rounded-full"></div>
                        )}
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full hidden items-center justify-center text-white text-sm font-bold">
                          {researcher.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <div className="text-xs text-gray-700 font-medium">
                        {researcher.name}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paper Animation and QR Code Section */}
                <div className="flex-grow w-full relative mt-8 min-h-0">
                  {/* Paper Animation - Centered */}
                  <div className="absolute left-1/2 top-44 transform -translate-x-3/4 -translate-y-1/2 z-10">
                    <div className="book-container w-96 h-64 sm:w-[450px] sm:h-72 lg:w-[500px] lg:h-96 flex items-center justify-center">
                      <div className="transition-opacity duration-700 ease-in-out" key={currentPage}>
                        {bookStates[currentPage].type === 'cover' ? (
                          <div className="book-cover w-48 h-64 sm:w-56 sm:h-72 lg:w-72 lg:h-96">
                            <div className="w-full h-full rounded-md sm:rounded-lg shadow-xl bg-white border p-3 sm:p-4 lg:p-6 flex flex-col justify-between">
                              <div className="flex flex-col h-full">
                                <div className="text-center mb-3">
                                  <div className="text-[8px] sm:text-xs lg:text-sm uppercase tracking-widest text-gray-500 mb-2 lg:mb-4">Research Paper</div>
                                  <div className="border-t border-gray-300 w-8 sm:w-12 lg:w-16 mx-auto mb-3 lg:mb-4"></div>
                                </div>
                                
                                <div className="flex-grow flex flex-col justify-center text-center">
                                  <h1 className="text-xs sm:text-sm lg:text-lg font-bold text-gray-800 leading-tight mb-3 lg:mb-4">
                                    Listener Perceptions of Accented Synthetic Speech
                                  </h1>
                                  <h2 className="text-[10px] sm:text-xs lg:text-base text-gray-600 mb-3 lg:mb-4">
                                    Analyzing the Impact of L1
                                  </h2>
                                </div>
                                
                                <div className="text-center border-t border-gray-300 pt-2 lg:pt-3">
                                  <p className="text-xs sm:text-sm lg:text-base font-semibold text-gray-700">2025</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="book-spread flex relative">
                            <div className="book-page-left w-40 h-64 sm:w-48 sm:h-72 lg:w-64 lg:h-96 rounded-l-md shadow-xl overflow-hidden" style={{ transform: 'rotateY(-8deg)' }}>
                              {pageImages[bookStates[currentPage].leftPage] ? (
                                <img 
                                  src={pageImages[bookStates[currentPage].leftPage]}
                                  alt={`Research paper page ${bookStates[currentPage].leftPage}`}
                                  className="w-full h-full object-cover object-top rounded-l-md"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'flex'
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 animate-pulse rounded-l-md flex items-center justify-center">
                                  <div className="text-sm text-gray-500">Loading...</div>
                                </div>
                              )}
                            </div>
                            
                            <div className="book-page-right w-40 h-64 sm:w-48 sm:h-72 lg:w-64 lg:h-96 rounded-r-md shadow-xl overflow-hidden" style={{ transform: 'rotateY(8deg)' }}>
                              {pageImages[bookStates[currentPage].rightPage] ? (
                                <img 
                                  src={pageImages[bookStates[currentPage].rightPage]}
                                  alt={`Research paper page ${bookStates[currentPage].rightPage}`}
                                  className="w-full h-full object-cover object-top rounded-r-md"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'flex'
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 animate-pulse rounded-r-md flex items-center justify-center">
                                  <div className="text-sm text-gray-500">Loading...</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* QR Code Section - Positioned at Right Edge */}
                  <div className="absolute right-8 top-1/3 transform -translate-y-1/2 z-20">
                    <div className="flex flex-col items-center space-y-6">
                      {/* Top Text */}
                      <div className="flex gap-8">
                        <span className="text-base lg:text-lg font-extrabold text-gray-800 uppercase tracking-wide">Survey</span>
                        <span className="text-base lg:text-lg font-extrabold text-gray-800 uppercase tracking-wide">Game</span>
                      </div>
                      
                      {/* QR Code with Corner Emojis */}
                      <div className="relative">
                        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                          <div className="relative h-32 w-32 sm:h-36 sm:w-36 lg:h-40 lg:w-40 rounded-lg overflow-hidden bg-gray-50">
                            {qrCodeUrl ? (
                              <img 
                                src={qrCodeUrl}
                                alt="QR Code for Survey, Game, LinkedIn and Research"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 animate-pulse"></div>
                            )}
                          </div>
                        </div>
                        
                        {/* Corner Emojis - Outside corners, tilted inward */}
                        <div className="absolute -top-6 -left-6 text-2xl bg-white rounded-full p-1 shadow-md transform rotate-12">📊</div>
                        <div className="absolute -top-6 -right-6 text-2xl bg-white rounded-full p-1 shadow-md transform -rotate-12">🎮</div>
                        <div className="absolute -bottom-6 -left-6 text-2xl bg-white rounded-full p-1 shadow-md transform -rotate-12">👔</div>
                        <div className="absolute -bottom-6 -right-6 text-2xl bg-white rounded-full p-1 shadow-md transform rotate-12">📄</div>
                      </div>
                      
                      {/* Bottom Text */}
                      <div className="flex gap-6">
                        <span className="text-base lg:text-lg font-extrabold text-gray-800 uppercase tracking-wide">LinkedIn</span>
                        <span className="text-base lg:text-lg font-extrabold text-gray-800 uppercase tracking-wide">Research</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Leaderboard */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-base sm:text-lg lg:text-xl text-gray-700 flex items-center justify-center gap-2 font-semibold">
                  <span>🏆</span> Accent Guessing Game Leaderboard
                </CardTitle>
                {totalPlayers > 0 && (
                  <p className="text-sm text-gray-500 mt-1 font-medium">
                    {totalPlayers} total players
                  </p>
                )}
              </CardHeader>
              <CardContent className="px-3 sm:px-4 pb-3 flex-1 flex flex-col">
                {leaderboardError ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-3">⚠️</div>
                    <p className="text-red-500 text-xs">Temporarily unavailable</p>
                  </div>
                ) : leaderboardData.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-3">🎯</div>
                    <p className="text-gray-500 text-xs">No players yet!</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between space-y-1">
                    {leaderboardData.slice(0, 10).map((player, index) => (
                      <div
                        key={player.id}
                        className={`
                          flex items-center justify-between py-3 px-3 rounded-lg border transition-all duration-300
                          ${index === 0 ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300' :
                            index === 1 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300' :
                            index === 2 ? 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-300' :
                            'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`font-bold min-w-[2rem] ${index < 3 ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
                            {getRankIcon(index)}
                          </div>
                          <div className="text-sm sm:text-base font-semibold text-gray-800 truncate max-w-[7rem] sm:max-w-[9rem]">
                            {player.name}
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-sm font-bold border ${getScoreColor(player.score)}`}>
                          {player.score}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-2 sm:mt-2 flex-shrink-0">
          <p className="text-xs text-muted-foreground">
            Last updated: {stats.lastUpdated}
          </p>
        </div>
      </div>
    </div>
    </>
  )
}