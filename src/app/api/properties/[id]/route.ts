import { NextResponse, type NextRequest } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Property } from '@/lib/types';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: propertyId } = await params;

  if (!propertyId) {
    return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
  }

  try {
    const propertyRef = doc(db, 'properties', propertyId);
    const propertySnap = await getDoc(propertyRef);

    if (!propertySnap.exists()) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const propertyData = { id: propertySnap.id, ...propertySnap.data() } as Property;
    return NextResponse.json(propertyData);
  } catch (error) {
    console.error('API GET /api/properties/[id] - Failed to get property:', error);
    return NextResponse.json({ error: 'Internal server error while fetching property.' }, { status: 500 });
  }
}
