import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    const pitch = await db.pitch.create({
      data: {
        title,
        description,
        category,
        tags: JSON.stringify(tags || []),
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
        status: 'ACTIVE',
        analysisScore: analysisScore || null,
        analysisData: analysisData ? JSON.stringify(analysisData) : null,
        aiImproved: aiImproved || false
      }
    });

    return NextResponse.json({ 
      success: true,
      pitch: {
        ...pitch,
        tags: JSON.parse(pitch.tags || '[]'),
        analysisData: pitch.analysisData ? JSON.parse(pitch.analysisData) : null
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

    let whereClause: any = { status: 'ACTIVE' };

    if (founderId) {
      whereClause.founderId = founderId;
    }

    if (category) {
      whereClause.category = category;
    }

    if (stage) {
      whereClause.stage = stage;
    }

    const pitches = await db.pitch.findMany({
      where: whereClause,
      include: {
        founder: {
          select: { name: true, walletAddress: true, isVerified: true }
        },
        _count: {
          select: { sessions: true, investments: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const formattedPitches = pitches.map(pitch => ({
      ...pitch,
      tags: JSON.parse(pitch.tags || '[]'),
      analysisData: pitch.analysisData ? JSON.parse(pitch.analysisData) : null
    }));

    const total = await db.pitch.count({ where: whereClause });

    return NextResponse.json({ 
      pitches: formattedPitches,
      total,
      hasMore: offset + limit < total
    });

  } catch (error) {
    console.error('Get pitches error:', error);
    return NextResponse.json({ error: 'Failed to fetch pitches' }, { status: 500 });
  }
}