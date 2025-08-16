'use client'

import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const researchers = [
  {
    name: "Igor Marchenko",
    url: "https://www.linkedin.com/in/marczenko",
    image: "igor.webp"
  },
  {
    name: "Jan Kokowski", 
    url: "https://www.linkedin.com/in/jan-kokowski-a21293110/",
    image: "jan.webp"
  },
  {
    name: "Stella Siu",
    url: "https://www.linkedin.com/in/stellasiu0427/",
    image: "stella.webp"
  }
]

const researchPaper = {
  title: "Listener Perceptions of Accented Synthetic Speech: Analyzing the Impact of L1",
  url: "https://drive.google.com/file/d/1WgOsbC7yM11WRXOFCqcsJiJHbl1NDgo-/view?usp=sharing"
}

export default function Researchers() {
  const [imageUrls, setImageUrls] = useState({})

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

  const openLink = (url) => {
    window.open(url, '_blank')
  }

  const LinkedInIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        
        {/* Survey Link */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 mb-4 sm:mb-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 leading-tight mb-1 sm:mb-2">
                  Survey - Exploring Voice Preferences
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Compare your responses to others at the end of the survey
                </p>
              </div>
              <div className="ml-3 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" className="sm:w-5 sm:h-5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17M19.5,19.1H4.5V5H19.5V19.1M19.5,3H4.5C3.4,3 2.5,3.9 2.5,5V19.1C2.5,20.2 3.4,21.1 4.5,21.1H19.5C20.6,21.1 21.5,20.2 21.5,19.1V5C21.5,3.9 20.6,3 19.5,3Z" />
                  </svg>
                </div>
              </div>
            </div>
            <button
              onClick={() => openLink('https://rug.eu.qualtrics.com/jfe/form/SV_byzC8IQg39x9tjg')}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Take Survey</span>
              <svg width="16" height="16" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Accented Voice Guessing Game */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 mb-6 sm:mb-8">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 leading-tight mb-1 sm:mb-2">
                  Accented Voice Guessing Game
                </h3>
              </div>
              <div className="ml-3 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" className="sm:w-5 sm:h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.5,9A1.5,1.5 0 0,0 13,10.5V12.5A1.5,1.5 0 0,0 14.5,14A1.5,1.5 0 0,0 16,12.5V10.5A1.5,1.5 0 0,0 14.5,9M16,4A2,2 0 0,1 18,6V18A2,2 0 0,1 16,20H8A2,2 0 0,1 6,18V6A2,2 0 0,1 8,4H16M14.5,5.5A3.5,3.5 0 0,0 11,9V14A3.5,3.5 0 0,0 14.5,17.5A3.5,3.5 0 0,0 18,14V9A3.5,3.5 0 0,0 14.5,5.5Z" />
                  </svg>
                </div>
              </div>
            </div>
            <button
              onClick={() => openLink('https://rug.eu.qualtrics.com/jfe/form/SV_0VxvX7djOkM0VJY')}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Play Game</span>
              <svg width="16" height="16" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Research Team Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Research Team
          </h1>
          <p className="text-gray-600">Connect with the researchers</p>
        </div>

        {/* Researcher Cards */}
        <div className="space-y-4 mb-8">
          {researchers.map((researcher, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                {/* Profile Image */}
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
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
                
                {/* Name */}
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {researcher.name}
                  </h3>
                </div>
                
                {/* LinkedIn Button */}
                <button
                  onClick={() => openLink(researcher.url)}
                  className="bg-[#0077B5] hover:bg-[#005885] text-white px-2 py-2 sm:px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 shadow-md hover:shadow-lg active:scale-95 flex-shrink-0"
                >
                  <LinkedInIcon />
                  <span className="text-xs sm:text-sm hidden sm:inline">LinkedIn</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Research Paper */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-purple-100">
          <div className="flex flex-col space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl text-white">📄</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 leading-tight mb-2">
                  {researchPaper.title}
                </h3>
              </div>
            </div>
            <button
              onClick={() => openLink(researchPaper.url)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              <span>Read Full Paper</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}