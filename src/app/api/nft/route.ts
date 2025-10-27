import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { 
      ownerId, 
      pitchId, 
      sessionId, 
      name, 
      description, 
      imageUrl, 
      animationUrl,
      metadata 
    } = await request.json();

    if (!ownerId || !name || !imageUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create NFT record in database
    const { data: nft, error } = await supabase
      .from('nfts')
      .insert({
        name,
        description,
        image_url: imageUrl,
        animation_url: animationUrl,
        owner_id: ownerId,
        pitch_id: pitchId,
        session_id: sessionId,
        metadata,
        minted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create NFT' }, { status: 500 });
    }

    // TODO: Integrate with actual NFT minting contract on Base
    // For now, we'll simulate the minting process
    const simulatedTokenId = Math.floor(Math.random() * 1000000);
    const contractAddress = "0x1234567890123456789012345678901234567890"; // Simulated contract

    // Update NFT with blockchain info
    const { data: updatedNft, error: updateError } = await supabase
      .from('nfts')
      .update({
        token_id: simulatedTokenId.toString(),
        contract_address: contractAddress
      })
      .eq('id', nft.id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase error:', updateError);
      return NextResponse.json({ error: 'Failed to update NFT' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      nft: updatedNft,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}` // Simulated tx hash
    });

  } catch (error) {
    console.error('NFT minting error:', error);
    return NextResponse.json({ error: 'Failed to mint NFT' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const pitchId = searchParams.get('pitchId');

    let query = supabase
      .from('nfts')
      .select(`
        *,
        owner:users!owner_id(name, wallet_address),
        pitch:pitches!pitch_id(title, description)
      `)
      .order('created_at', { ascending: false });

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    } else if (pitchId) {
      query = query.eq('pitch_id', pitchId);
    } else {
      return NextResponse.json({ error: 'Owner ID or Pitch ID is required' }, { status: 400 });
    }

    const { data: nfts, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 });
    }

    return NextResponse.json({ nfts });

  } catch (error) {
    console.error('Get NFTs error:', error);
    return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 });
  }
}