import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { processQuestionData } from '../../../lib/voicePreferences'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { ResponseId, ...questionData } = body

    // Process and validate question data using utility function
    const processedQuestionData = processQuestionData(questionData)

    const insertData = {
      ResponseId,
      ...processedQuestionData
    }

    const { error } = await supabase
      .from('responses')
      .insert([insertData])

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Duplicate response' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ status: 'ok' })
    
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
  })
}