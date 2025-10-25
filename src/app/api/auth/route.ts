import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, email, name, role } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Check if user already exists
    let user = await db.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      // Create new user
      user = await db.user.create({
        data: {
          walletAddress,
          email: email || null,
          name: name || null,
          role: role || 'FOUNDER'
        }
      });
    } else {
      // Update existing user
      user = await db.user.update({
        where: { walletAddress },
        data: {
          email: email || user.email,
          name: name || user.name,
          role: role || user.role,
          updatedAt: new Date()
        }
      });
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

    const user = await db.user.findUnique({
      where: { walletAddress },
      include: {
        pitches: true,
        investments: true,
        sessions: true,
        nfts: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}