
'use server';

import { revalidatePath } from 'next/cache';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { encrypt } from '@/lib/crypto';
import type { Anime, UserProfile } from '@/lib/types';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/firebase-admin';

// This is a partial type, as the full form data has genres as a string.
// We only need the chapters to encrypt them.
type AnimeFormData = Omit<Anime, 'id' | 'chapters'> & {
  chapters: { title?: string; url: string }[];
  genres: string; // In the form, genres are a comma-separated string
};

async function getAdminUserProfile(): Promise<UserProfile | null> {
  try {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      console.log('No session cookie found.');
      return null;
    }

    if (!adminApp) {
        console.error("Firebase Admin SDK not initialized.");
        return null;
    }

    const decodedToken = await getAuth(adminApp).verifySessionCookie(sessionCookie, true);
    
    const adminDb = getFirestore(adminApp);
    const userDocRef = adminDb.collection('users').doc(decodedToken.uid);
    const userDocSnap = await userDocRef.get();

    if (userDocSnap.exists()) {
        const userProfile = userDocSnap.data() as UserProfile;
        if (userProfile.role === 'admin') {
            return userProfile;
        } else {
            console.log(`User ${decodedToken.uid} is not an admin.`);
            return null;
        }
    }
    console.log(`User profile for ${decodedToken.uid} does not exist.`);
    return null;
  } catch (error) {
    if ((error as any).code === 'auth/session-cookie-expired' || (error as any).code === 'auth/id-token-expired') {
        console.log('Session cookie expired.');
    } else {
        console.error('Error verifying session cookie or fetching user profile:', error);
    }
    return null;
  }
}

async function processAndEncryptData(values: AnimeFormData) {
  const genresArray = values.genres.split(',').map(g => g.trim());

  const encryptedChapters = values.chapters.map(chapter => ({
    ...chapter,
    url: chapter.url && chapter.url.length < 100 ? encrypt(chapter.url) : chapter.url,
  }));

  return {
    ...values,
    bannerImage: values.bannerImage || `https://placehold.co/1200x400.png`,
    genres: genresArray,
    chapters: encryptedChapters,
  };
}

export async function addAnimeAction(values: AnimeFormData) {
  const adminUser = await getAdminUserProfile();
  if (!adminUser) {
    return { success: false, message: 'Permission denied. You must be an administrator.' };
  }

  try {
    const submissionData = await processAndEncryptData(values);
    await addDoc(collection(db, 'animes'), submissionData);
    
    revalidatePath('/admin');
    revalidatePath('/');
    
    return { success: true, message: `${values.title} has been added.` };
  } catch (error: any) {
    console.error('Error in addAnimeAction:', error);
    return { success: false, message: `Error adding anime: ${error.message}` };
  }
}

export async function updateAnimeAction(id: string, values: AnimeFormData) {
  const adminUser = await getAdminUserProfile();
  if (!adminUser) {
    return { success: false, message: 'Permission denied. You must be an administrator.' };
  }
  
  try {
    const submissionData = await processAndEncryptData(values);
    const docRef = doc(db, 'animes', id);
    await updateDoc(docRef, submissionData);

    revalidatePath('/admin');
    revalidatePath(`/admin/edit/${id}`);
    revalidatePath(`/anime/${id}`);
    revalidatePath('/');

    return { success: true, message: `${values.title} has been updated.` };
  } catch (error: any) {
    console.error('Error in updateAnimeAction:', error);
    return { success: false, message: `Error updating anime: ${error.message}` };
  }
}


export async function addAdAction(url: string) {
    const adminUser = await getAdminUserProfile();
    if (!adminUser) {
        return { success: false, message: 'Permission denied. You must be an administrator.' };
    }

    if (!url || !/^https:/i.test(url)) {
        return { success: false, message: 'Invalid ad URL provided.' };
    }

    try {
        await addDoc(collection(db, 'ads'), { url });
        revalidatePath('/admin');
        return { success: true, message: 'Ad has been added.' };
    } catch (error: any) {
        console.error('Error in addAdAction:', error);
        return { success: false, message: `Error adding ad: ${error.message}` };
    }
}

export async function deleteAdAction(id: string) {
    const adminUser = await getAdminUserProfile();
    if (!adminUser) {
        return { success: false, message: 'Permission denied. You must be an administrator.' };
    }

    try {
        await deleteDoc(doc(db, 'ads', id));
        revalidatePath('/admin');
        return { success: true, message: 'Ad has been deleted.' };
    } catch (error: any) {
        console.error('Error in deleteAdAction:', error);
        return { success: false, message: `Error deleting ad: ${error.message}` };
    }
}
