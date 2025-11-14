
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { AddAnimeForm } from '@/components/admin/add-anime-form';
import { Loader2 } from 'lucide-react';
import { AnimeList } from '@/components/admin/anime-list';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Anime, Ad } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AdManagement } from '@/components/admin/ad-management';

export default function AdminPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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
    if (!isAuthorized) return;
    
    const animesCollection = collection(db, 'animes');
    const adsCollection = collection(db, 'ads');

    const unsubAnimes = onSnapshot(animesCollection, (snapshot) => {
      const animeList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Anime));
      setAnimes(animeList);
    }, (error) => {
      console.error("Error fetching animes:", error);
    });

    const unsubAds = onSnapshot(adsCollection, (snapshot) => {
      const adList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Ad));
      setAds(adList);
    }, (error) => {
      console.error("Error fetching ads:", error);
    });
    
    setLoadingData(false);

    return () => {
      unsubAnimes();
      unsubAds();
    };
  }, [isAuthorized]);

  if (authLoading || !isAuthorized) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold font-headline glow-text text-primary">Panel de Administración</h1>
        <p className="text-lg text-muted-foreground">Gestiona el catálogo de contenido y anuncios.</p>
      </header>
      
      <Accordion type="single" collapsible className="w-full" defaultValue="anime-list">
        <AccordionItem value="add-anime">
          <AccordionTrigger className="text-2xl font-headline hover:text-primary transition-colors">Agregar Nuevo Contenido</AccordionTrigger>
          <AccordionContent>
            <div className="max-w-4xl mx-auto pt-4">
              <AddAnimeForm />
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="anime-list">
          <AccordionTrigger className="text-2xl font-headline hover:text-primary transition-colors">Catálogo Existente</AccordionTrigger>
          <AccordionContent>
             <div className="max-w-6xl mx-auto pt-4">
               {loadingData ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
               ) : (
                  <AnimeList animes={animes} />
               )}
             </div>
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="ad-management">
          <AccordionTrigger className="text-2xl font-headline hover:text-primary transition-colors">Gestionar Anuncios</AccordionTrigger>
          <AccordionContent>
             <div className="max-w-4xl mx-auto pt-4">
              {loadingData ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
               ) : (
                 <AdManagement ads={ads} />
               )}
             </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
