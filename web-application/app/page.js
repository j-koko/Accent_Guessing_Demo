'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'

export default function Home() {
  const [stats, setStats] = useState({
    participants: 0,
    nationalities: 0,
    lastUpdated: 'Loading...'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)

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

  // Auto-flip pages every 5 seconds with smooth transitions
  useEffect(() => {
    const autoFlip = setInterval(() => {
      setCurrentPage(prev => (prev + 1) % 5) // 5 states: cover, spread1, spread2, spread3, cover
    }, 5000)

    return () => clearInterval(autoFlip)
  }, [])

  const bookStates = [
    { type: 'cover', isOpen: false },
    { type: 'spread', leftPage: 0, rightPage: 1, isOpen: true },
    { type: 'spread', leftPage: 2, rightPage: 3, isOpen: true },
    { type: 'spread', leftPage: 4, rightPage: 5, isOpen: true },
    { type: 'cover', isOpen: false }
  ]

  const pages = [
    { title: "Abstract", subtitle: "Understanding voice perception across cultures", bg: "bg-white border" },
    { title: "Introduction", subtitle: "Background and motivation", bg: "bg-white border" },
    { title: "Methodology", subtitle: "Research approach and design", bg: "bg-white border" },
    { title: "Analysis", subtitle: "Data processing techniques", bg: "bg-white border" },
    { title: "Results", subtitle: "Key findings and insights", bg: "bg-white border" },
    { title: "Conclusion", subtitle: "Summary and future work", bg: "bg-white border" }
  ]

  const coverPage = {
    title: "Accent Perception",
    subtitle: "Research Study",
    year: "2024",
    bg: "bg-gradient-to-br from-blue-600 to-indigo-700 text-white"
  }

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
      `}</style>
      <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
        <div className="container mx-auto px-6 py-4 h-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-primary mb-2 tracking-tight">
            Accent Perception
            <span className="block text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
              Research Dashboard
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              error ? 'bg-red-500' : isLoading ? 'bg-yellow-500' : 'bg-green-500'
            }`}></span>
            <p className="text-sm text-muted-foreground">
              {error ? 'Stats Unavailable' : isLoading ? 'Loading...' : 'Live Statistics'}
            </p>
          </div>
        </div>

        {/* Top Row - Stats */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Participants Card */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl text-gray-700">Survey Participants</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl font-bold text-blue-600 mb-2 font-mono">
                {isLoading ? '---' : stats.participants}
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Total Responses
              </Badge>
              {error && (
                <p className="text-sm text-red-500 mt-2">Real-time data unavailable</p>
              )}
            </CardContent>
          </Card>

          {/* Nationalities Card */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl text-gray-700">Nationalities Represented</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-6xl font-bold text-indigo-600 mb-2 font-mono">
                {isLoading ? '---' : stats.nationalities}
              </div>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                Languages/Countries
              </Badge>
              {error && (
                <p className="text-sm text-red-500 mt-2">Real-time data unavailable</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section - Research Team with Centered Book */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm h-[calc(100vh-400px)]">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-xl">Research Team & Publication</CardTitle>
            <CardDescription className="text-sm">Meet our researchers and explore our findings</CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            <div className="grid grid-cols-4 gap-6 h-full">
              
              {/* Left Side - Research Team */}
              <div className="col-span-1 flex flex-col justify-center space-y-4 -mt-8">
                {[
                  { name: "Name 1"},
                  { name: "Name 2"},
                  { name: "Name 3"},
                  { name: "Name 4"}
                ].map((researcher, index) => (
                  <div key={index} className="text-center space-y-2 -mt-8">
                    <div className="w-14 h-14 mx-auto bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      <div className="text-white text-sm">👤</div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {researcher.name}
                    </div>
                  </div>
                ))}
              </div>


              {/* Center - 3D Opening Book */}
              <div className="col-span-2 flex items-center justify-center">
                <div className="relative">
                  <div className="book-container">
                    <div className="transition-opacity duration-700 ease-in-out" key={currentPage}>
                      {bookStates[currentPage].type === 'cover' ? (
                        /* Closed Book Cover */
                        <div className="book-cover w-48 h-64 mx-auto">
                          <div className={`w-full h-full rounded-lg shadow-2xl p-4 flex flex-col justify-between transform transition-all duration-500 ${coverPage.bg}`}>
                          <div>
                            <h3 className="text-lg font-bold mb-2 text-white">{coverPage.title}</h3>
                            <p className="text-sm text-white">{coverPage.subtitle}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-white">{coverPage.year}</p>
                          </div>
                          </div>
                        </div>
                      ) : (
                        /* Open Book Spread */
                        <div className="book-spread flex relative">
                          {/* Left Page */}
                          <div className={`book-page-left w-48 h-64 rounded-l-lg shadow-xl ${pages[bookStates[currentPage].leftPage].bg}`}
                               style={{ transform: 'rotateY(-8deg)' }}>
                            <div className="page-content w-full h-full p-4 flex flex-col justify-between">
                              <div>
                                <h3 className="text-sm font-bold mb-2 text-gray-800">
                                  {pages[bookStates[currentPage].leftPage].title}
                                </h3>
                                <p className="text-xs text-gray-600 mb-2">
                                  {pages[bookStates[currentPage].leftPage].subtitle}
                                </p>
                                <div className="space-y-1">
                                  {[1,2,3,4,5,6].map((i) => (
                                    <div key={i} className="h-1 bg-gray-300 rounded" style={{width: `${70 + (i * 5)}%`}}></div>
                                  ))}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-400">Page {bookStates[currentPage].leftPage + 1}</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right Page */}
                          <div className={`book-page-right w-48 h-64 rounded-r-lg shadow-xl ${pages[bookStates[currentPage].rightPage].bg}`}
                               style={{ transform: 'rotateY(8deg)' }}>
                            <div className="page-content w-full h-full p-4 flex flex-col justify-between">
                              <div>
                                <h3 className="text-sm font-bold mb-2 text-gray-800">
                                  {pages[bookStates[currentPage].rightPage].title}
                                </h3>
                                <p className="text-xs text-gray-600 mb-2">
                                  {pages[bookStates[currentPage].rightPage].subtitle}
                                </p>
                                <div className="space-y-1">
                                  {[1,2,3,4,5,6].map((i) => (
                                    <div key={i} className="h-1 bg-gray-300 rounded" style={{width: `${70 + (i * 5)}%`}}></div>
                                  ))}
                                </div>
                              </div>
                              <div className="text-left">
                                <div className="text-xs text-gray-400">Page {bookStates[currentPage].rightPage + 1}</div>
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
              <div className="col-span-1 flex flex-col items-center justify-center -mt-10">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Linkedin & Research</h3>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-28 w-28 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="text-center">
                      <div className="text-3xl mb-2">📄</div>
                      <p className="text-xs text-gray-600 font-medium">QR Placeholder</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-xs text-muted-foreground">
            Last updated: {stats.lastUpdated}
          </p>
        </div>
      </div>
    </div>
    </>
  )
}