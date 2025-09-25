import { NextResponse, type NextRequest } from 'next/server';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, displayName, phone, notifications, privacy } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Update user profile in Firebase
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (displayName !== undefined) {
      updateData.displayName = displayName;
    }

    if (phone !== undefined) {
      updateData.phone = phone;
    }

    if (notifications !== undefined) {
      updateData.notifications = notifications;
    }

    if (privacy !== undefined) {
      updateData.privacy = privacy;
    }

    await updateDoc(userRef, updateData);

    // Get updated user data
    const updatedUserSnap = await getDoc(userRef);
    const updatedUser = {
      id: updatedUserSnap.id,
      ...updatedUserSnap.data()
    };

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('API PUT /api/users/profile/update - Failed to update profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
