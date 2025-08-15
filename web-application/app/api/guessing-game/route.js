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
      return NextResponse.json({ error: 'Name and score are required' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
      })
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json({ error: 'Score must be a non-negative number' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
      })
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
      return NextResponse.json({ error: 'Database error' }, { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
      })
    }

    return NextResponse.json({ status: 'ok' }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    })
    
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Server error' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = parseInt(searchParams.get('offset')) || 0
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

    if (offset > 0) {
      query = query.range(offset, offset + limit - 1)
    } else if (limit > 0) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
      })
    }

    // Get total count and global stats
    const { count, error: countError } = await supabase
      .from('guessing_game')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Count error:', countError)
      return NextResponse.json({ error: 'Database error' }, { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
      })
    }

    // Get global statistics
    const { data: statsData, error: statsError } = await supabase
      .from('guessing_game')
      .select('score')

    let globalStats = {
      averageScore: 0,
      highestScore: 0
    }

    if (!statsError && statsData && statsData.length > 0) {
      const scores = statsData.map(player => player.score)
      globalStats.averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      globalStats.highestScore = Math.max(...scores)
    }

    return NextResponse.json({
      data,
      total: count,
      globalStats
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    })
    
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Server error' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    })
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