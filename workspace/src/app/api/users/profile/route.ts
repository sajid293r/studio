import { NextResponse, type NextRequest } from 'next/server';
import { getUserProfile, createUserProfile } from '@/app/lib/user-actions';
import type { UserProfile } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const userProfile = await getUserProfile(uid);
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, ...profileData } = body;

    if (!uid || !profileData.email) {
      return NextResponse.json({ error: 'User ID and email are required' }, { status: 400 });
    }
    
    await createUserProfile(uid, profileData as Partial<UserProfile>);
    return NextResponse.json({ message: 'User profile created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Failed to create user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
