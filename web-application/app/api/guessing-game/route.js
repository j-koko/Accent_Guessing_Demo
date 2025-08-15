import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, score } = body

    if (!name || score === undefined || score === null) {
      return NextResponse.json({ error: 'Name and score are required' }, { status: 400 })
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json({ error: 'Score must be a non-negative number' }, { status: 400 })
    }

    const insertData = {
      name: name.trim(),
      score: parseInt(score)
    }

    const { error } = await supabase
      .from('guessing_game')
      .insert([insertData])

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ status: 'ok' })
    
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 10
    const orderBy = searchParams.get('orderBy') || 'score'
    const order = searchParams.get('order') || 'desc'

    let query = supabase
      .from('guessing_game')
      .select('*')

    if (orderBy === 'score') {
      query = query.order('score', { ascending: order === 'asc' })
    } else if (orderBy === 'created_at') {
      query = query.order('created_at', { ascending: order === 'asc' })
    }

    if (limit > 0 && limit <= 100) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json(data)
    
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }
  })
}