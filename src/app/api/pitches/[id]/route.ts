import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pitchId = params.id;

    if (!pitchId) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 });
    }

    const pitch = await db.pitch.findUnique({
      where: { 
        id: pitchId,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        tags: true,
        deckUrl: true,
        oneLiner: true,
        targetAmount: true,
        equityOffered: true,
        valuation: true,
        traction: true,
        teamSize: true,
        stage: true,
        isPublic: true,
        status: true,
        analysisScore: true,
        analysisData: true,
        aiImproved: true,
        createdAt: true,
        updatedAt: true,
        founder: {
          select: { 
            name: true, 
            walletAddress: true, 
            isVerified: true,
            bio: true,
            profileImage: true
          }
        },
        sessions: {
          select: {
            id: true,
            startTime: true,
            status: true,
            investor: {
              select: {
                name: true,
                walletAddress: true
              }
            }
          },
          orderBy: { startTime: 'desc' }
        },
        investments: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
            investor: {
              select: {
                name: true,
                walletAddress: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { 
            sessions: true, 
            investments: true
          }
        }
      }
    });

    if (!pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 });
    }

    // Format the response
    const formattedPitch = {
      ...pitch,
      tags: JSON.parse(pitch.tags || '[]'),
      analysisData: pitch.analysisData ? JSON.parse(pitch.analysisData) : null,
      totalInvestment: pitch.investments.reduce((sum, inv) => sum + inv.amount, 0),
      fundingProgress: (pitch.targetAmount && pitch.targetAmount > 0) 
        ? (pitch.investments.reduce((sum, inv) => sum + inv.amount, 0) / pitch.targetAmount) * 100 
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
    const allowedUpdates = {
      title: updates.title,
      description: updates.description,
      oneLiner: updates.oneLiner,
      traction: updates.traction,
      targetAmount: updates.targetAmount,
      equityOffered: updates.equityOffered,
      valuation: updates.valuation,
      status: updates.status
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => 
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    const updatedPitch = await db.pitch.update({
      where: { id: pitchId },
      data: allowedUpdates,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        tags: true,
        deckUrl: true,
        oneLiner: true,
        targetAmount: true,
        equityOffered: true,
        valuation: true,
        traction: true,
        teamSize: true,
        stage: true,
        isPublic: true,
        status: true,
        analysisScore: true,
        analysisData: true,
        aiImproved: true,
        createdAt: true,
        updatedAt: true,
        founder: {
          select: { name: true, walletAddress: true, isVerified: true }
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      pitch: {
        ...updatedPitch,
        tags: JSON.parse(updatedPitch.tags || '[]'),
        analysisData: updatedPitch.analysisData ? JSON.parse(updatedPitch.analysisData) : null
      }
    });

  } catch (error) {
    console.error('Update pitch error:', error);
    return NextResponse.json({ error: 'Failed to update pitch' }, { status: 500 });
  }
}