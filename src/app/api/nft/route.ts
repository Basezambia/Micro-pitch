import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    const nft = await db.nFT.create({
      data: {
        name,
        description,
        imageUrl,
        animationUrl,
        ownerId,
        pitchId,
        sessionId,
        metadata,
        mintedAt: new Date()
      }
    });

    // TODO: Integrate with actual NFT minting contract on Base
    // For now, we'll simulate the minting process
    const simulatedTokenId = Math.floor(Math.random() * 1000000);
    const contractAddress = "0x1234567890123456789012345678901234567890"; // Simulated contract

    // Update NFT with blockchain info
    const updatedNft = await db.nFT.update({
      where: { id: nft.id },
      data: {
        tokenId: simulatedTokenId.toString(),
        contractAddress
      }
    });

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

    let nfts;

    if (ownerId) {
      nfts = await db.nFT.findMany({
        where: { ownerId },
        include: {
          owner: {
            select: { name: true, walletAddress: true }
          },
          pitch: {
            select: { title: true, description: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (pitchId) {
      nfts = await db.nFT.findMany({
        where: { pitchId },
        include: {
          owner: {
            select: { name: true, walletAddress: true }
          },
          pitch: {
            select: { title: true, description: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      return NextResponse.json({ error: 'Owner ID or Pitch ID is required' }, { status: 400 });
    }

    return NextResponse.json({ nfts });

  } catch (error) {
    console.error('Get NFTs error:', error);
    return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 });
  }
}