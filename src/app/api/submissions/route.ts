import { NextResponse, type NextRequest } from 'next/server';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Submission } from '@/lib/types';

// GET - Fetch submissions for a user
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const propertyId = searchParams.get('propertyId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    let q = query(
      collection(db, 'submissions'),
      where('userId', '==', userId)
    );

    if (propertyId) {
      q = query(
        collection(db, 'submissions'),
        where('userId', '==', userId),
        where('propertyId', '==', propertyId)
      );
    }

    const querySnapshot = await getDocs(q);
    const submissions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Submission));

    // Sort by createdAt on the client side to avoid index requirement
    submissions.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt || 0);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('API GET /api/submissions - Failed to fetch submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

// POST - Create new submission
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, ...submissionData } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const submissionWithMeta = {
      ...submissionData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'submissions'), submissionWithMeta);
    
    const newSubmission = {
      id: docRef.id,
      ...submissionWithMeta
    };

    return NextResponse.json(newSubmission, { status: 201 });
  } catch (error) {
    console.error('API POST /api/submissions - Failed to create submission:', error);
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }
}
