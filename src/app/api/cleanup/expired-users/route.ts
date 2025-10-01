import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cleanupExpiredTokens } from '@/lib/magic-link-store';

export async function POST(req: NextRequest) {
  try {
    console.log('Starting cleanup of expired users and tokens...');
    
    // Clean up expired magic link tokens
    const cleanedTokens = cleanupExpiredTokens();
    console.log(`Cleaned up ${cleanedTokens} expired magic link tokens`);
    
    // Clean up expired temporary users
    const usersQuery = query(
      collection(db, 'users'),
      where('isTemporary', '==', true)
    );
    
    const userDocs = await getDocs(usersQuery);
    const now = new Date();
    let cleanedUsers = 0;
    
    for (const userDoc of userDocs.docs) {
      const userData = userDoc.data();
      
      // Check if user has expired
      if (userData.expiresAt && now > userData.expiresAt.toDate()) {
        await deleteDoc(doc(db, 'users', userDoc.id));
        cleanedUsers++;
        console.log(`Deleted expired temporary user: ${userData.email}`);
      }
    }
    
    console.log(`Cleanup completed: ${cleanedUsers} expired users removed`);
    
    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      cleanedTokens,
      cleanedUsers,
    });
    
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}

// Also support GET for manual cleanup
export async function GET(req: NextRequest) {
  return POST(req);
}
