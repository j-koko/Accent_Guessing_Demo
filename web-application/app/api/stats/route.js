import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Cache for statistics to avoid excessive database queries
let statsCache = null
let cacheTimestamp = 0
const CACHE_DURATION = 30000 // 30 seconds

export async function GET() {
  try {
    const now = Date.now()
    
    // Return cached data if still valid
    if (statsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(statsCache)
    }

    // Query total participants (count of responses)
    const { count: participantCount, error: participantError } = await supabase
      .from('responses')
      .select('*', { count: 'exact', head: true })

    if (participantError) {
      console.error('Error fetching participant count:', participantError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Query language data (q1_language and q1_text for "other" cases)
    const { data: languageData, error: languageError } = await supabase
      .from('responses')
      .select('q1_language, q1_text')
      .not('q1_language', 'is', null)

    if (languageError) {
      console.error('Error fetching language data:', languageError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Extract languages using same logic as Python code
    const languageList = languageData.map(row => {
      let language = String(row.q1_language || '').trim()
      
      // Extract English part before "|" separator (handles both old and new formats)
      if (language.includes('|')) {
        language = language.split('|')[0].trim();
      }
      
      // If language starts with "other", use the q1_text field (like in Python)
      if (language.toLowerCase().startsWith('other')) {
        const otherText = String(row.q1_text || '').trim()
        // Don't include if it's empty or "unspecified"
        if (!otherText || otherText.toLowerCase() === 'unspecified') {
          return null
        }
        language = `Other: ${otherText}`
      }
      
      return language
    }).filter(lang => lang && lang !== '' && lang !== 'null')

    // Normalize languages for uniqueness (case-insensitive)
    // Create a map to preserve the original case of the first occurrence
    const languageMap = new Map()
    
    languageList.forEach(lang => {
      const normalizedKey = lang.toLowerCase()
      if (!languageMap.has(normalizedKey)) {
        languageMap.set(normalizedKey, lang)
      }
    })

    // Get unique languages preserving original case
    const uniqueLanguages = Array.from(languageMap.values())
    const sortedLanguages = uniqueLanguages.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))

    const stats = {
      participants: participantCount || 0,
      nationalities: sortedLanguages.length,
      languages: sortedLanguages,
      lastUpdated: new Date().toISOString()
    }

    // Update cache
    statsCache = stats
    cacheTimestamp = now

    return NextResponse.json(stats)
    
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    }
  })
}