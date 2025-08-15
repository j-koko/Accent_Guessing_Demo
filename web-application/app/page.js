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
        .research-grid {
          display: grid;
          grid-template-rows: auto 1fr;
          grid-template-columns: 1fr;
          grid-template-areas: 
            "avatars"
            "content";
          height: 100%;
          gap: clamp(0.5rem, 2vw, 1.5rem);
        }
        
        @media (min-width: 768px) and (max-width: 1279px) {
          .research-grid {
            grid-template-rows: auto auto auto;
            grid-template-areas: 
              "avatars"
              "book"
              "qr";
          }
        }
        
        @media (min-width: 1280px) {
          .research-grid {
            grid-template-columns: 1fr auto;
            grid-template-areas: 
              "avatars avatars"
              "book qr";
          }
        }
        
        .avatars-section {
          grid-area: avatars;
        }
        
        .book-section {
          grid-area: book;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 0;
        }
        
        .qr-section {
          grid-area: qr;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 0;
        }
        
        .content-section {
          grid-area: content;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(1rem, 4vw, 2rem);
          min-height: 0;
        }
        
        @media (min-width: 1280px) {
          .content-section {
            display: contents;
          }
        }
        
        .book-container {
          perspective: clamp(800px, 150vw, 1500px);
          perspective-origin: center center;
          width: 100%;
          max-width: clamp(180px, 45vw, 500px);
          aspect-ratio: 1.2;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        @media (max-width: 640px) {
          .book-container {
            max-width: clamp(160px, 80vw, 300px);
            aspect-ratio: 1.1;
          }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          .book-container {
            max-width: clamp(200px, 60vw, 400px);
          }
        }
        
        .book-cover {
          width: 50%;
          height: 100%;
          aspect-ratio: 0.7;
          transform-style: preserve-3d;
          transition: all 0.8s ease-in-out;
          margin: 0 auto;
        }
        
        .book-spread {
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
          transform-style: preserve-3d;
          transition: all 0.8s ease-in-out;
        }
        
        .book-page-left, .book-page-right {
          transform-style: preserve-3d;
          will-change: transform;
          transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          width: 50%;
          height: 100%;
          aspect-ratio: 0.7;
        }
        
        .book-page-left {
          transform-origin: right center;
        }
        
        .book-page-right {
          transform-origin: left center;
        }
        
        .qr-container {
          width: clamp(100px, 18vw, 200px);
          aspect-ratio: 1;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(0.4rem, 1.5vw, 1rem);
        }
        
        @media (max-width: 640px) {
          .qr-container {
            width: clamp(80px, 25vw, 150px);
          }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          .qr-container {
            width: clamp(120px, 20vw, 180px);
          }
        }
        
        .qr-code-wrapper {
          width: 100%;
          aspect-ratio: 1;
          position: relative;
          padding: clamp(0.75rem, 3vw, 1.5rem);
        }
        
        .qr-emoji {
          position: absolute;
          width: clamp(1.5rem, 4vw, 2.5rem);
          height: clamp(1.5rem, 4vw, 2.5rem);
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 50%;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          font-size: clamp(0.75rem, 2vw, 1.25rem);
        }
        
        .qr-text {
          font-size: clamp(0.75rem, 2vw, 1rem);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #374151;
        }
        
        .language-flow {
          animation: flowRightToLeft linear infinite;
          white-space: nowrap;
          font-size: clamp(0.7rem, 1.5vw, 1rem);
        }
        
        @keyframes flowRightToLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100vw);
          }
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
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-x-hidden">
        <div className="container mx-auto min-h-screen flex flex-col" style={{ 
          padding: 'clamp(0.5rem, 2vw, 1.5rem) clamp(0.5rem, 3vw, 2rem)'
        }}>
        {/* Header */}
        <div className="text-center" style={{ marginBottom: 'clamp(0.75rem, 3vw, 1.5rem)' }}>
          <h1 
            className="font-bold text-primary tracking-tight leading-tight"
            style={{ 
              fontSize: 'clamp(1.125rem, 5vw, 3rem)',
              marginBottom: 'clamp(0.25rem, 1vw, 0.5rem)'
            }}
          >
            <span className="hidden sm:inline">Accent Perception Research Dashboard</span>
            <span className="sm:hidden">Accent Research Dashboard</span>
          </h1>
          <div className="flex items-center justify-center" style={{ gap: 'clamp(0.25rem, 1vw, 0.5rem)' }}>
            <span 
              className={`rounded-full animate-pulse ${
                error ? 'bg-red-500' : isLoading ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ 
                width: 'clamp(0.375rem, 1vw, 0.5rem)', 
                height: 'clamp(0.375rem, 1vw, 0.5rem)' 
              }}
            ></span>
            <p 
              className="text-muted-foreground"
              style={{ fontSize: 'clamp(0.625rem, 2vw, 0.875rem)' }}
            >
              {error ? 'Stats Unavailable' : isLoading ? 'Loading...' : 'Live Statistics'}
            </p>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 flex-grow overflow-hidden" style={{ gap: 'clamp(0.5rem, 1.5vw, 1.5rem)' }}>
          {/* Left Side - Stats and Research Section */}
          <div className="col-span-12 xl:col-span-9 flex flex-col" style={{ gap: 'clamp(0.5rem, 1.5vw, 1rem)' }}>
            {/* Top Row - Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 'clamp(0.5rem, 1.5vw, 1rem)' }}>
              {/* Participants Card */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center" style={{ paddingBottom: 'clamp(0.25rem, 1vw, 0.5rem)' }}>
                  <CardTitle 
                    className="text-gray-700"
                    style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}
                  >
                    Survey Participants
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div 
                    className="font-bold text-blue-600 font-mono"
                    style={{ 
                      fontSize: 'clamp(1.5rem, 6vw, 3rem)',
                      marginBottom: 'clamp(0.25rem, 1vw, 0.25rem)'
                    }}
                  >
                    {isLoading ? '---' : stats.participants}
                  </div>
                  {error && (
                    <p 
                      className="text-red-500 mt-1"
                      style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)' }}
                    >
                      Real-time data unavailable
                    </p>
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
                
                <CardHeader className="text-center relative z-10" style={{ paddingBottom: 'clamp(0.25rem, 1vw, 0.5rem)' }}>
                  <CardTitle 
                    className="text-gray-700"
                    style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}
                  >
                    Languages Represented
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center relative z-10">
                  <div 
                    className="font-bold text-indigo-600 font-mono"
                    style={{ 
                      fontSize: 'clamp(1.5rem, 6vw, 3rem)',
                      marginBottom: 'clamp(0.25rem, 1vw, 0.25rem)'
                    }}
                  >
                    {isLoading ? '---' : stats.nationalities}
                  </div>
                  {error && (
                    <p 
                      className="text-red-500 mt-1"
                      style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)' }}
                    >
                      Real-time data unavailable
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Research Section */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm flex-grow overflow-hidden min-h-0">
              <CardHeader className="text-center pb-1 sm:pb-2 flex-shrink-0">
                <CardTitle style={{ fontSize: 'clamp(1rem, 4vw, 2rem)' }} className="text-gray-700 font-semibold">Research Team & Paper</CardTitle>
              </CardHeader>
              <CardContent className="h-full overflow-hidden relative" style={{ padding: 'clamp(0.75rem, 3vw, 1.5rem)' }}>
                <div className="research-grid">
                  
                  {/* Research Team Avatars */}
                  <div className="avatars-section">
                    <div className="flex justify-center gap-[clamp(0.5rem,2vw,1.5rem)]">
                      {researchers.map((researcher, index) => (
                        <div key={index} className="text-center">
                          <div 
                            className="rounded-full overflow-hidden border-2 border-white shadow-lg bg-gray-100 mx-auto mb-1"
                            style={{ 
                              width: 'clamp(2.5rem, 8vw, 6rem)', 
                              height: 'clamp(2.5rem, 8vw, 6rem)' 
                            }}
                          >
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
                          <div 
                            className="text-gray-700 font-medium"
                            style={{ fontSize: 'clamp(0.6rem, 1.5vw, 0.875rem)' }}
                          >
                            {researcher.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Content Section - Stacks on mobile, splits on desktop */}
                  <div className="content-section">
                    
                    {/* Book Animation Section */}
                    <div className="book-section">
                      <div className="book-container">
                        <div className="transition-opacity duration-700 ease-in-out" key={currentPage}>
                          {bookStates[currentPage].type === 'cover' ? (
                            <div className="book-cover">
                              <div className="w-full h-full rounded-lg shadow-xl bg-white border flex flex-col justify-between" style={{ padding: 'clamp(0.5rem, 2vw, 1.5rem)' }}>
                                <div className="flex flex-col h-full">
                                  <div className="text-center" style={{ marginBottom: 'clamp(0.25rem, 1vw, 0.75rem)' }}>
                                    <div 
                                      className="uppercase tracking-widest text-gray-500"
                                      style={{ 
                                        fontSize: 'clamp(0.5rem, 1.5vw, 0.875rem)',
                                        marginBottom: 'clamp(0.25rem, 1vw, 0.5rem)'
                                      }}
                                    >
                                      Research Paper
                                    </div>
                                    <div 
                                      className="border-t border-gray-300 mx-auto"
                                      style={{ width: 'clamp(1rem, 4vw, 4rem)' }}
                                    ></div>
                                  </div>
                                  
                                  <div className="flex-grow flex flex-col justify-center text-center">
                                    <h1 
                                      className="font-bold text-gray-800 leading-tight"
                                      style={{ 
                                        fontSize: 'clamp(0.5rem, 2vw, 1.125rem)',
                                        marginBottom: 'clamp(0.25rem, 1vw, 0.75rem)'
                                      }}
                                    >
                                      Listener Perceptions of Accented Synthetic Speech
                                    </h1>
                                    <h2 
                                      className="text-gray-600"
                                      style={{ 
                                        fontSize: 'clamp(0.4rem, 1.5vw, 1rem)',
                                        marginBottom: 'clamp(0.25rem, 1vw, 0.75rem)'
                                      }}
                                    >
                                      Analyzing the Impact of L1
                                    </h2>
                                  </div>
                                  
                                  <div className="text-center border-t border-gray-300" style={{ paddingTop: 'clamp(0.25rem, 1vw, 0.75rem)' }}>
                                    <p 
                                      className="font-semibold text-gray-700"
                                      style={{ fontSize: 'clamp(0.5rem, 1.5vw, 1rem)' }}
                                    >
                                      2025
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="book-spread flex relative">
                              <div className="book-page-left rounded-l-lg shadow-xl overflow-hidden" style={{ transform: 'rotateY(-8deg)' }}>
                                {pageImages[bookStates[currentPage].leftPage] ? (
                                  <img 
                                    src={pageImages[bookStates[currentPage].leftPage]}
                                    alt={`Research paper page ${bookStates[currentPage].leftPage}`}
                                    className="w-full h-full object-cover object-top rounded-l-lg"
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                      e.target.nextSibling.style.display = 'flex'
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 animate-pulse rounded-l-lg flex items-center justify-center">
                                    <div className="text-gray-500" style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.875rem)' }}>Loading...</div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="book-page-right rounded-r-lg shadow-xl overflow-hidden" style={{ transform: 'rotateY(8deg)' }}>
                                {pageImages[bookStates[currentPage].rightPage] ? (
                                  <img 
                                    src={pageImages[bookStates[currentPage].rightPage]}
                                    alt={`Research paper page ${bookStates[currentPage].rightPage}`}
                                    className="w-full h-full object-cover object-top rounded-r-lg"
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                      e.target.nextSibling.style.display = 'flex'
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 animate-pulse rounded-r-lg flex items-center justify-center">
                                    <div className="text-gray-500" style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.875rem)' }}>Loading...</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="qr-section">
                      <div className="qr-container">
                        {/* Top Text */}
                        <div className="flex gap-[clamp(0.75rem,3vw,2rem)]">
                          <span className="qr-text">Survey</span>
                          <span className="qr-text">Game</span>
                        </div>
                        
                        {/* QR Code with Corner Emojis */}
                        <div className="qr-code-wrapper">
                          <div className="bg-white rounded-xl shadow-lg border border-gray-100 w-full h-full" style={{ padding: 'clamp(0.5rem, 2vw, 1rem)' }}>
                            <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-50">
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
                          
                          {/* Corner Emojis */}
                          <div className="qr-emoji" style={{ top: '0', left: '0', transform: 'rotate(12deg)' }}>📊</div>
                          <div className="qr-emoji" style={{ top: '0', right: '0', transform: 'rotate(-12deg)' }}>🎮</div>
                          <div className="qr-emoji" style={{ bottom: '0', left: '0', transform: 'rotate(-12deg)' }}>👔</div>
                          <div className="qr-emoji" style={{ bottom: '0', right: '0', transform: 'rotate(12deg)' }}>📄</div>
                        </div>
                        
                        {/* Bottom Text */}
                        <div className="flex gap-[clamp(0.75rem,3vw,1.5rem)]">
                          <span className="qr-text">LinkedIn</span>
                          <span className="qr-text">Research</span>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Leaderboard */}
          <div className="col-span-12 xl:col-span-3">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-700 flex items-center justify-center gap-2 font-semibold">
                  <span>🏆</span> 
                  <span className="sm:hidden">Accent Game</span>
                  <span className="hidden lg:inline">Leaderboard</span>
                </CardTitle>
                {totalPlayers > 0 && (
                  <p className="text-xs sm:text-sm lg:text-base text-gray-500 mt-1 font-medium">
                    {totalPlayers} total players
                  </p>
                )}
              </CardHeader>
              <CardContent className="px-2 sm:px-3 lg:px-4 pb-3 flex-1 flex flex-col">
                {leaderboardError ? (
                  <div className="text-center py-6 lg:py-8">
                    <div className="text-2xl lg:text-3xl mb-2 lg:mb-3">⚠️</div>
                    <p className="text-red-500 text-xs lg:text-sm">Temporarily unavailable</p>
                  </div>
                ) : leaderboardData.length === 0 ? (
                  <div className="text-center py-6 lg:py-8">
                    <div className="text-2xl lg:text-3xl mb-2 lg:mb-3">🎯</div>
                    <p className="text-gray-500 text-xs lg:text-sm">No players yet!</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between space-y-1 lg:space-y-2">
                    {leaderboardData.slice(0, 10).map((player, index) => (
                      <div
                        key={player.id}
                        className={`
                          flex items-center justify-between py-2 sm:py-2.5 lg:py-3 px-2 sm:px-3 rounded-lg border transition-all duration-300
                          ${index === 0 ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300' :
                            index === 1 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300' :
                            index === 2 ? 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-300' :
                            'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-1.5 sm:space-x-2 lg:space-x-3">
                          <div className={`font-bold min-w-[1.5rem] sm:min-w-[2rem] ${index < 3 ? 'text-lg sm:text-xl lg:text-2xl' : 'text-sm sm:text-base lg:text-lg'}`}>
                            {getRankIcon(index)}
                          </div>
                          <div className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800 truncate max-w-[5rem] sm:max-w-[7rem] lg:max-w-[9rem] xl:max-w-[6rem]">
                            {player.name}
                          </div>
                        </div>
                        <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold border ${getScoreColor(player.score)}`}>
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
        <div className="text-center flex-shrink-0" style={{ marginTop: 'clamp(0.5rem, 2vw, 1.5rem)' }}>
          <p 
            className="text-muted-foreground"
            style={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.875rem)' }}
          >
            Last updated: {stats.lastUpdated}
          </p>
        </div>
      </div>
    </div>
    </>
  )
}