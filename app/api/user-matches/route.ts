import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabaseAdmin = createSupabaseAdmin()
    
    // Get the latest match for this user
    const { data: userMatchesArray, error: matchError } = await supabaseAdmin
      .from('user_matches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (matchError) {
      console.error('Error fetching user matches:', matchError)
      return NextResponse.json({ error: 'Failed to fetch user matches' }, { status: 500 })
    }

    if (!userMatchesArray || userMatchesArray.length === 0) {
      return NextResponse.json({ userMatches: null })
    }

    const userMatches = userMatchesArray[0]
    return NextResponse.json({ userMatches })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}