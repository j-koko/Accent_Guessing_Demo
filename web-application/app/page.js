'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { createClient } from '@supabase/supabase-js'

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

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
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

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
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
    }, 5000)

    return () => clearInterval(autoFlip)
  }, [])

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
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-x-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 min-h-screen flex flex-col">
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

        {/* Top Row - Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 flex-shrink-0">
          {/* Participants Card */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg sm:text-xl text-gray-700">Survey Participants</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-600 mb-2 font-mono">
                {isLoading ? '---' : stats.participants}
              </div>
              {error && (
                <p className="text-sm text-red-500 mt-2">Real-time data unavailable</p>
              )}
            </CardContent>
          </Card>

          {/* Languages Card */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm relative overflow-hidden">
            {/* Language Background Flow */}
            {stableLanguages.size > 0 && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Create individual flowing languages using stable positions */}
                {Array.from(stableLanguages.entries()).map(([cleanLanguage, config]) => {
                  return (
                    <div
                      key={`stable-lang-${cleanLanguage}`}
                      className="absolute language-flow text-indigo-600 font-medium select-none whitespace-nowrap"
                      style={{
                        top: `${config.stableTop}%`,
                        left: 'calc(100% + 50px)',
                        opacity: 0.5,
                        fontSize: `${config.stableSize}rem`,
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
              <CardTitle className="text-lg sm:text-xl text-gray-700">Languages Represented</CardTitle>
            </CardHeader>
            <CardContent className="text-center relative z-10">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-indigo-600 mb-2 font-mono">
                {isLoading ? '---' : stats.nationalities}
              </div>

              {error && (
                <p className="text-sm text-red-500 mt-2">Real-time data unavailable</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section - Research Team with Centered Book */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm flex-grow min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] xl:h-[calc(100vh-400px)] mb-4 sm:mb-8">
          <CardHeader className="text-center pb-0">
            <CardTitle className="text-lg sm:text-xl">Research Team & Publication</CardTitle>
          </CardHeader>
          <CardContent className="h-full -mt-4 sm:-mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 h-full">
              
              {/* Left Side - Research Team */}
              <div className="lg:col-span-1 flex lg:flex-col justify-center lg:space-y-6 space-x-4 lg:space-x-0 lg:-mt-16 order-2 lg:order-1">
                {researchers.map((researcher, index) => (
                  <div key={index} className="text-center space-y-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:mx-auto rounded-full overflow-hidden border-3 border-white shadow-lg bg-gray-100">
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
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full hidden items-center justify-center text-white text-lg font-bold">
                        {researcher.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700 font-medium">
                      {researcher.name}
                    </div>
                  </div>
                ))}
              </div>


              {/* Center - 3D Opening Book */}
              <div className="lg:col-span-2 flex items-center justify-center lg:-mt-16 order-1 lg:order-2">
                <div className="relative">
                  <div className="book-container">
                    <div className="transition-opacity duration-700 ease-in-out" key={currentPage}>
                      {bookStates[currentPage].type === 'cover' ? (
                        /* Research Paper Cover */
                        <div className="book-cover w-72 h-[21rem] sm:w-80 sm:h-[24rem] lg:w-96 lg:h-[28rem] mx-auto">
                          <div className="w-full h-full rounded-xl shadow-2xl bg-white border p-12 flex flex-col justify-between transform transition-all duration-500">
                            <div className="flex flex-col h-full">
                              <div className="text-center mb-8">
                                <div className="text-sm uppercase tracking-widest text-gray-500 mb-4">Research Paper</div>
                                <div className="border-t border-gray-300 w-24 mx-auto mb-8"></div>
                              </div>
                              
                              <div className="flex-grow flex flex-col justify-center text-center px-4">
                                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 leading-tight mb-4 sm:mb-6">
                                  Listener Perceptions of Accented Synthetic Speech
                                </h1>
                                <h2 className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8">
                                  Analyzing the Impact of L1
                                </h2>
                              </div>
                              
                              <div className="text-center border-t border-gray-300 pt-4">
                                <p className="text-lg font-semibold text-gray-700">2025</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Open Book Spread */
                        <div className="book-spread flex relative">
                          {/* Left Page */}
                          <div className="book-page-left w-96 h-[28rem] rounded-l-xl shadow-xl overflow-hidden"
                               style={{ transform: 'rotateY(-8deg)' }}>
                            {pageImages[bookStates[currentPage].leftPage] ? (
                              <img 
                                src={pageImages[bookStates[currentPage].leftPage]}
                                alt={`Research paper page ${bookStates[currentPage].leftPage}`}
                                className="w-full h-full object-cover object-top rounded-l-lg"
                                onLoad={() => console.log(`Page ${bookStates[currentPage].leftPage} loaded successfully`)}
                                onError={(e) => {
                                  console.error(`Failed to load page ${bookStates[currentPage].leftPage}:`, e.target.src)
                                  console.error('Error event:', e)
                                  // Try to fetch the URL directly to see the actual error
                                  fetch(e.target.src).then(response => {
                                    console.log(`Fetch response for page ${bookStates[currentPage].leftPage}:`, response.status, response.statusText)
                                  }).catch(fetchError => {
                                    console.error(`Fetch error for page ${bookStates[currentPage].leftPage}:`, fetchError)
                                  })
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 animate-pulse rounded-l-xl flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-base text-gray-500">Loading page {bookStates[currentPage].leftPage}...</div>
                                </div>
                              </div>
                            )}
                            <div className="w-full h-full bg-white border rounded-l-lg p-4 flex-col justify-center items-center hidden">
                              <div className="text-center">
                                <div className="text-2xl mb-2">📄</div>
                                <div className="text-xs text-gray-500">Page {bookStates[currentPage].leftPage}</div>
                                <div className="text-xs text-gray-400 mt-1">Failed to load</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right Page */}
                          <div className="book-page-right w-96 h-[28rem] rounded-r-xl shadow-xl overflow-hidden"
                               style={{ transform: 'rotateY(8deg)' }}>
                            {pageImages[bookStates[currentPage].rightPage] ? (
                              <img 
                                src={pageImages[bookStates[currentPage].rightPage]}
                                alt={`Research paper page ${bookStates[currentPage].rightPage}`}
                                className="w-full h-full object-cover object-top rounded-r-lg"
                                onLoad={() => console.log(`Page ${bookStates[currentPage].rightPage} loaded successfully`)}
                                onError={(e) => {
                                  console.error(`Failed to load page ${bookStates[currentPage].rightPage}:`, e.target.src)
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 animate-pulse rounded-r-xl flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-base text-gray-500">Loading page {bookStates[currentPage].rightPage}...</div>
                                </div>
                              </div>
                            )}
                            <div className="w-full h-full bg-white border rounded-r-lg p-4 flex-col justify-center items-center hidden">
                              <div className="text-center">
                                <div className="text-2xl mb-2">📄</div>
                                <div className="text-xs text-gray-500">Page {bookStates[currentPage].rightPage}</div>
                                <div className="text-xs text-gray-400 mt-1">Failed to load</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - QR Code */}
              <div className="lg:col-span-1 flex flex-col items-center justify-center lg:-mt-16 order-3">
                <div className="text-center">
                  <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-4 sm:mb-6">Linkedin & Research</h3>
                  <div className="h-32 w-32 sm:h-36 sm:w-36 lg:h-40 lg:w-40 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    {qrCodeUrl ? (
                      <img 
                        src={qrCodeUrl}
                        alt="QR Code for LinkedIn and Research"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl"></div>
                    )}
                    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hidden items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <div className="text-3xl mb-2">📄</div>
                        <p className="text-xs text-gray-600 font-medium">QR Loading...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-2 sm:mt-4 flex-shrink-0">
          <p className="text-xs text-muted-foreground">
            Last updated: {stats.lastUpdated}
          </p>
        </div>
      </div>
    </div>
    </>
  )
}