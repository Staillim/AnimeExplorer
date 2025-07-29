
"use client";

import { useEffect, useState } from 'react';
import { useRouter, notFound, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { AddAnimeForm } from '@/components/admin/add-anime-form';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Anime } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

async function getAnime(id: string): Promise<Anime | null> {
  const docRef = doc(db, 'animes', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Anime;
  } else {
    return null;
  }
}

export default function EditAnimePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loadingAnime, setLoadingAnime] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (userProfile?.role === 'admin') {
        setIsAuthorized(true);
      } else {
        router.push('/');
      }
    }
  }, [userProfile, authLoading, router]);

  useEffect(() => {
    if (!isAuthorized || !id) return;

    getAnime(id)
      .then(data => {
        if (data) {
          // Ensure seasons exist to avoid breaking the form
          if (!data.seasons) {
            // @ts-ignore - backward compatibility
            data.seasons = [{ title: data.season || "Temporada 1", language: 'sub', chapters: data.chapters || [] }];
          }
          setAnime(data);
        } else {
          notFound();
        }
      })
      .finally(() => setLoadingAnime(false));
  }, [isAuthorized, id]);

  const handleSuccess = () => {
    router.push('/admin');
  };

  const isLoading = authLoading || loadingAnime || !isAuthorized;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!anime) {
    return notFound();
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <Button asChild variant="outline">
            <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Panel
            </Link>
        </Button>
      </header>
      <div className="max-w-4xl mx-auto">
        <AddAnimeForm animeToEdit={anime} onSuccess={handleSuccess}/>
      </div>
    </div>
  );
}
