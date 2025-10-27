import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pitchId = params.id;

    if (!pitchId) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 });
    }

    const { data: pitch, error } = await supabase
      .from('pitches')
      .select(`
        *,
        founder:users!founder_id(name, wallet_address, is_verified, bio, profile_image),
        sessions:pitch_sessions(
          id,
          start_time,
          status,
          investor:users!investor_id(name, wallet_address)
        ),
        investments(
          id,
          amount,
          created_at,
          investor:users!investor_id(name, wallet_address)
        )
      `)
      .eq('id', pitchId)
      .eq('status', 'ACTIVE')
      .single();

    if (error || !pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 });
    }

    // Format the response
    const formattedPitch = {
      ...pitch,
      tags: JSON.parse(pitch.tags || '[]'),
      analysisData: pitch.analysis_data ? JSON.parse(pitch.analysis_data) : null,
      totalInvestment: pitch.investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0,
      fundingProgress: (pitch.target_amount && pitch.target_amount > 0) 
        ? ((pitch.investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0) / pitch.target_amount) * 100 
        : 0
    };

    return NextResponse.json({ 
      success: true,
      pitch: formattedPitch
    });

  } catch (error) {
    console.error('Get pitch error:', error);
    return NextResponse.json({ error: 'Failed to fetch pitch' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pitchId = params.id;
    const updates = await request.json();

    if (!pitchId) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 });
    }

    // Only allow certain fields to be updated
    const allowedUpdates: any = {};
    
    if (updates.title !== undefined) allowedUpdates.title = updates.title;
    if (updates.description !== undefined) allowedUpdates.description = updates.description;
    if (updates.oneLiner !== undefined) allowedUpdates.one_liner = updates.oneLiner;
    if (updates.traction !== undefined) allowedUpdates.traction = updates.traction;
    if (updates.targetAmount !== undefined) allowedUpdates.target_amount = updates.targetAmount;
    if (updates.equityOffered !== undefined) allowedUpdates.equity_offered = updates.equityOffered;
    if (updates.valuation !== undefined) allowedUpdates.valuation = updates.valuation;
    if (updates.status !== undefined) allowedUpdates.status = updates.status;

    const { data: updatedPitch, error } = await supabase
      .from('pitches')
      .update(allowedUpdates)
      .eq('id', pitchId)
      .select(`
        *,
        founder:users!founder_id(name, wallet_address, is_verified)
      `)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update pitch' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      pitch: {
        ...updatedPitch,
        tags: JSON.parse(updatedPitch.tags || '[]'),
        analysisData: updatedPitch.analysis_data ? JSON.parse(updatedPitch.analysis_data) : null
      }
    });

  } catch (error) {
    console.error('Update pitch error:', error);
    return NextResponse.json({ error: 'Failed to update pitch' }, { status: 500 });
  }
}