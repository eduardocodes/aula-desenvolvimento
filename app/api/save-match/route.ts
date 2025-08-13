import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { userId, creatorIds, category } = await request.json()

    if (!userId || !creatorIds || !Array.isArray(creatorIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, creatorIds' },
        { status: 400 }
      )
    }

    console.log('Saving match for user:', userId, 'category:', category, 'creators:', creatorIds.length)

    // Check if a match already exists for this user and category
    const searchCriteria = { category: category || 'all' }
    const { data: existingMatch, error: searchError } = await supabaseAdmin
      .from('user_matches')
      .select('*')
      .eq('user_id', userId)
      .eq('search_criteria', JSON.stringify(searchCriteria))
      .maybeSingle()

    console.log('Existing match search:', { existingMatch, searchError })

    if (existingMatch) {
      // Update existing match
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('user_matches')
        .update({ 
          creator_ids: creatorIds,
          created_at: new Date().toISOString()
        })
        .eq('id', existingMatch.id)
        .select()

      if (updateError) {
        console.log('Update error:', updateError)
        return NextResponse.json({ error: 'Failed to update match' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        action: 'updated',
        data: updateData 
      })
    } else {
      // Create new match - skip user validation for demo
      console.log('Creating new match...')
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('user_matches')
        .insert({
          user_id: userId,
          creator_ids: creatorIds,
          search_criteria: searchCriteria
        })
        .select()

      console.log('Insert error:', insertError)
      
      if (insertError) {
        return NextResponse.json({ error: 'Failed to create match' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        action: 'created',
        data: insertData 
      })
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}