
'use server';

import { config } from 'dotenv';
config(); // Load environment variables FIRST.

import { revalidatePath } from 'next/cache';
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
      console.log('Admin check failed: No session cookie found.');
      return null;
    }
    
    if (!adminApp) {
        console.error("Firebase Admin SDK not initialized. Server Actions will fail.");
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
        }
    }
    console.log(`Admin check failed: User ${decodedToken.uid} is not an admin or profile does not exist.`);
    return null;
  } catch (error) {
    console.error('Error verifying admin user profile:', error);
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
    const adminDb = getFirestore(adminApp);
    const submissionData = await processAndEncryptData(values);
    await adminDb.collection('animes').add(submissionData);
    
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
    const adminDb = getFirestore(adminApp);
    const submissionData = await processAndEncryptData(values);
    const docRef = adminDb.collection('animes').doc(id);
    await docRef.update(submissionData);

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

export async function deleteAnimeAction(id: string) {
    const adminUser = await getAdminUserProfile();
    if (!adminUser) {
        return { success: false, message: 'Permission denied. You must be an administrator.' };
    }

    try {
        const adminDb = getFirestore(adminApp);
        await adminDb.collection('animes').doc(id).delete();
        revalidatePath('/admin');
        revalidatePath('/');
        return { success: true, message: 'Contenido eliminado.' };
    } catch (error: any) {
        console.error('Error in deleteAnimeAction:', error);
        return { success: false, message: `Error deleting content: ${error.message}` };
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
        const adminDb = getFirestore(adminApp);
        await adminDb.collection('ads').add({ url });
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
        const adminDb = getFirestore(adminApp);
        await adminDb.collection('ads').doc(id).delete();
        revalidatePath('/admin');
        return { success: true, message: 'Ad has been deleted.' };
    } catch (error: any) {
        console.error('Error in deleteAdAction:', error);
        return { success: false, message: `Error deleting ad: ${error.message}` };
    }
}
