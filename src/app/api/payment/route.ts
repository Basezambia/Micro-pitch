import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, amount, walletAddress } = await request.json();

    if (!sessionId || !amount || !walletAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('pitch_sessions')
      .select(`
        *,
        pitch:pitches(*),
        investor:users!investor_id(*)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // TODO: Integrate with actual Base Pay SDK
    // For now, we'll simulate the payment process
    const simulatedPaymentId = `pay_${Math.random().toString(36).substr(2, 9)}`;
    const simulatedTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    // Update session with payment info
    const { data: updatedSession, error: updateError } = await supabase
      .from('pitch_sessions')
      .update({
        total_cost: amount,
        payment_tx_id: simulatedTxHash,
        status: 'COMPLETED',
        end_time: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase error:', updateError);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    // Create NFT certificate for completed session
    const nftMetadata = {
      name: `Pitch Certificate: ${session.pitch.title}`,
      description: `Certificate of completion for pitch session with ${session.investor.name || 'Investor'}`,
      image: session.pitch_id, // This would be the IPFS hash of the generated certificate image
      attributes: [
        {
          trait_type: "Duration",
          value: session.duration
        },
        {
          trait_type: "Total Cost",
          value: `${amount} USDC`
        },
        {
          trait_type: "Session Date",
          value: new Date(session.created_at).toISOString().split('T')[0]
        },
        {
          trait_type: "Investor",
          value: session.investor.name || "Anonymous Investor"
        }
      ],
      external_url: "https://micropitch.app"
    };

    // Upload metadata to IPFS
    const ipfsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ipfs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'upload_json',
        data: nftMetadata,
        name: `pitch-certificate-${sessionId}`
      })
    });

    const ipfsResult = await ipfsResponse.json();

    if (ipfsResult.success) {
      // Create NFT record
      const { error: nftError } = await supabase
        .from('nfts')
        .insert({
          name: nftMetadata.name,
          description: nftMetadata.description,
          image_url: `https://gateway.pinata.cloud/ipfs/${ipfsResult.ipfsHash}`,
          metadata: ipfsResult.ipfsUrl,
          owner_id: session.pitch.founder_id,
          pitch_id: session.pitch_id,
          session_id: session.id,
          minted_at: new Date().toISOString()
        });

      if (nftError) {
        console.error('NFT creation error:', nftError);
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: simulatedPaymentId,
      transactionHash: simulatedTxHash,
      amount,
      session: updatedSession,
      nftMinted: ipfsResult.success
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const { data: session, error } = await supabase
      .from('pitch_sessions')
      .select(`
        *,
        pitch:pitches(*),
        investor:users!investor_id(*)
      `)
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      session,
      paymentStatus: session.payment_tx_id ? 'completed' : 'pending'
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    return NextResponse.json({ error: 'Failed to get payment status' }, { status: 500 });
  }
}