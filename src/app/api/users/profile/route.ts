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
      // This is a valid case where the user exists in Auth but not yet in Firestore.
      // The client will handle creating the profile.
      return NextResponse.json(null, { status: 404 });
    }
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('API GET /api/users/profile - Failed to get user profile:', error);
    return NextResponse.json({ error: 'Internal server error while fetching profile.' }, { status: 500 });
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
    const newUserProfile = await getUserProfile(uid);
    if (!newUserProfile) {
       return NextResponse.json({ error: 'Failed to retrieve newly created user profile.' }, { status: 500 });
    }

    return NextResponse.json(newUserProfile, { status: 201 });
  } catch (error) {
    console.error('API POST /api/users/profile - Failed to create user profile:', error);
    return NextResponse.json({ error: 'Internal server error while creating profile.' }, { status: 500 });
  }
}
