
'use server';

import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import type { UserProfile, Property } from '@/lib/types';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { z } from 'zod';
import { propertySchema } from '@/lib/types';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const user = docSnap.data() as UserProfile;
    
    // Fetch properties for the user
    const propertiesQuery = query(collection(db, "properties"), where("ownerId", "==", uid));
    const querySnapshot = await getDocs(propertiesQuery);
    user.properties = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
    
    return { ...user, uid: docSnap.id };
  } else {
    return null;
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    return usersList;
}

export async function createUserProfile(uid: string, data: Partial<UserProfile>) {
  const docRef = doc(db, 'users', uid);
  // Check if the user's email is the designated admin email
  const isAdmin = data.email === 'umairg3539@gmail.com';
  console.log('isAdmin', isAdmin);

  await setDoc(docRef, {
    ...data,
    createdAt: new Date(),
    properties: [],
    isAdmin: isAdmin,
  }, { merge: true });
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
  });
}

export async function addProperty(userId: string, values: Omit<z.infer<typeof propertySchema>, 'logo'>, logoFile: File | null): Promise<Property> {
  let logoUrl = '';

  if (logoFile) {
    const storageRef = ref(storage, `logos/${userId}/${Date.now()}_${logoFile.name}`);
    await uploadBytes(storageRef, logoFile);
    logoUrl = await getDownloadURL(storageRef);
  }

  const newProperty: Omit<Property, 'id'> = {
    ownerId: userId,
    name: values.name,
    address: values.address,
    contactPhone: values.contactPhone,
    logoUrl: logoUrl,
    createdAt: new Date().toISOString() as any,
    subscription_status: 'inactive'
  };

  // Add property to properties collection
  const docRef = await addDoc(collection(db, 'properties'), newProperty);
  const property = { id: docRef.id, ...newProperty };

  // Update user profile to include the new property
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const existingProperties = userData.properties || [];
    
    await updateDoc(userRef, {
      properties: [...existingProperties, property],
      updatedAt: new Date()
    });
  }

  return property;
}
