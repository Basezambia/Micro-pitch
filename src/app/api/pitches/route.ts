import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const {
      title,
      description,
      category,
      tags,
      oneLiner,
      targetAmount,
      equityOffered,
      valuation,
      traction,
      teamSize,
      stage,
      deckUrl,
      founderId,
      creatorWalletAddress,
      analysisScore,
      analysisData,
      aiImproved
    } = await request.json();

    if (!title || !description || !category || !founderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create new pitch with analysis data
    const { data: pitch, error } = await supabase
      .from('pitches')
      .insert({
        title,
        description,
        category,
        tags: JSON.stringify(tags || []),
        one_liner: oneLiner,
        target_amount: targetAmount,
        equity_offered: equityOffered,
        valuation,
        traction,
        team_size: teamSize,
        stage,
        deck_url: deckUrl,
        founder_id: founderId,
        creator_wallet_address: creatorWalletAddress,
        status: 'ACTIVE',
        analysis_score: analysisScore || null,
        analysis_data: analysisData ? JSON.stringify(analysisData) : null,
        ai_improved: aiImproved || false
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create pitch' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      pitch: {
        ...pitch,
        tags: JSON.parse(pitch.tags || '[]'),
        analysisData: pitch.analysis_data ? JSON.parse(pitch.analysis_data) : null
      }
    });

  } catch (error) {
    console.error('Create pitch error:', error);
    return NextResponse.json({ error: 'Failed to create pitch' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const founderId = searchParams.get('founderId');
    const category = searchParams.get('category');
    const stage = searchParams.get('stage');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('pitches')
      .select(`
        *,
        founder:users!founder_id(name, wallet_address, is_verified),
        sessions:pitch_sessions(count),
        investments(count)
      `)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (founderId) {
      query = query.eq('founder_id', founderId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (stage) {
      query = query.eq('stage', stage);
    }

    const { data: pitches, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch pitches' }, { status: 500 });
    }

    const formattedPitches = pitches?.map(pitch => ({
      ...pitch,
      tags: JSON.parse(pitch.tags || '[]'),
      analysisData: pitch.analysis_data ? JSON.parse(pitch.analysis_data) : null
    })) || [];

    return NextResponse.json({ 
      pitches: formattedPitches,
      total: count || 0,
      hasMore: offset + limit < (count || 0)
    });

  } catch (error) {
    console.error('Get pitches error:', error);
    return NextResponse.json({ error: 'Failed to fetch pitches' }, { status: 500 });
  }
}