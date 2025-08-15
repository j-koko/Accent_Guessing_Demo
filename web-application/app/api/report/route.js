import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getAllValidColumns } from '../../../lib/voicePreferences'
import { calculateAccentMetrics } from '../../../lib/accentMetrics'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const responseId = searchParams.get('responseId')

    const { data: allResponses, error } = await supabase
      .from('responses')
      .select('*')

    if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (allResponses.length === 0) {
      return NextResponse.json({ error: 'No responses found' }, { status: 404 })
    }

    const userResponse = allResponses.find(r => r.ResponseId === responseId)
    
    if (!userResponse) {
      return NextResponse.json({ error: 'Response not found', isWaiting: true }, { status: 202 })
    }

    // Extract all question-related data from the response
    const userQuestionData = {}
    const questionColumns = getAllValidColumns()
    
    questionColumns.forEach(key => {
      if (userResponse[key] !== undefined) {
        userQuestionData[key] = userResponse[key]
      }
    })

    // Calculate accent metrics
    let accentMetrics = null;
    try {
      accentMetrics = calculateAccentMetrics(responseId, allResponses);
    } catch (error) {
      console.warn('Error calculating accent metrics:', error.message);
    }

    const result = {
      you: userQuestionData,
      allResponses: allResponses,
      accentMetrics: accentMetrics
    }

    return NextResponse.json(result)
    
  } catch (error) {
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