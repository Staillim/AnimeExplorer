'use server';

import { revalidatePath } from 'next/cache';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { encrypt } from '@/lib/crypto';
import type { Anime } from '@/lib/types';

// This is a partial type, as the full form data has genres as a string.
// We only need the chapters to encrypt them.
type AnimeFormData = Omit<Anime, 'id' | 'chapters'> & {
  chapters: { title?: string; url: string }[];
  genres: string; // In the form, genres are a comma-separated string
};

async function processAndEncryptData(values: AnimeFormData) {
  const genresArray = values.genres.split(',').map(g => g.trim());

  const encryptedChapters = values.chapters.map(chapter => ({
    ...chapter,
    // Encrypt the URL if it's not already a long hex string (i.e., encrypted)
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
  try {
    const submissionData = await processAndEncryptData(values);
    await addDoc(collection(db, 'animes'), submissionData);
    
    revalidatePath('/admin');
    revalidatePath('/');
    
    return { success: true, message: `${values.title} has been added.` };
  } catch (error: any) {
    return { success: false, message: `Error adding anime: ${error.message}` };
  }
}

export async function updateAnimeAction(id: string, values: AnimeFormData) {
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
    return { success: false, message: `Error updating anime: ${error.message}` };
  }
}
