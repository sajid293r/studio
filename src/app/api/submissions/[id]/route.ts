import { NextResponse, type NextRequest } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Submission } from '@/lib/types';

// GET - Fetch single submission
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docRef = doc(db, 'submissions', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const submission = {
      id: docSnap.id,
      ...docSnap.data()
    } as Submission;

    return NextResponse.json(submission);
  } catch (error) {
    console.error('API GET /api/submissions/[id] - Failed to fetch submission:', error);
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
  }
}

// PUT - Update submission
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const docRef = doc(db, 'submissions', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const updateData = {
      ...body,
      updatedAt: new Date()
    };

    await updateDoc(docRef, updateData);

    const updatedSubmission = {
      id: docSnap.id,
      ...docSnap.data(),
      ...updateData
    } as Submission;

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error('API PUT /api/submissions/[id] - Failed to update submission:', error);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}

// DELETE - Delete submission
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docRef = doc(db, 'submissions', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    await deleteDoc(docRef);

    return NextResponse.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('API DELETE /api/submissions/[id] - Failed to delete submission:', error);
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
  }
}
