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

    // Query unique nationalities/languages
    // Using q1_language as proxy for nationality since that's what we have
    const { data: nationalityData, error: nationalityError } = await supabase
      .from('responses')
      .select('q1_language')
      .not('q1_language', 'is', null)

    if (nationalityError) {
      console.error('Error fetching nationality data:', nationalityError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Count unique languages/nationalities
    const uniqueNationalities = new Set(
      nationalityData
        .map(row => row.q1_language?.trim()?.toLowerCase())
        .filter(lang => lang && lang !== '' && lang !== 'other')
    )

    const stats = {
      participants: participantCount || 0,
      nationalities: uniqueNationalities.size,
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