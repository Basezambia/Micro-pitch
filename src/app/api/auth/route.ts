import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, email, name, role } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    let user;
    if (!existingUser) {
      // Create new user
      const { data: newUser, error } = await supabaseAdmin
        .from('users')
        .insert({
          wallet_address: walletAddress,
          email: email || null,
          name: name || null,
          role: role || 'FOUNDER'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      user = newUser;
    } else {
      // Update existing user
      const { data: updatedUser, error } = await supabaseAdmin
        .from('users')
        .update({
          email: email || existingUser.email,
          name: name || existingUser.name,
          role: role || existingUser.role,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
      }
      user = updatedUser;
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        pitches(*),
        investments(*),
        sessions:pitch_sessions(*),
        nfts(*)
      `)
      .eq('wallet_address', walletAddress)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}