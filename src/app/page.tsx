
"use client";

import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Anime } from '@/lib/types';
import AnimeCard from '@/components/anime-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Autoplay from "embla-carousel-autoplay";


interface CarouselSection {
  title: string;
  animes: Anime[];
}

export default function Home() {
  const [sections, setSections] = useState<CarouselSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroAnimes, setHeroAnimes] = useState<Anime[]>([]);

  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const animesCollection = collection(db, 'animes');
        
        const allDocsQuery = query(animesCollection, orderBy('year', 'desc'));
        const animeSnapshot = await getDocs(allDocsQuery);
        const allAnimes = animeSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Anime));
        
        const trendingAnimes = [...allAnimes].sort((a,b) => b.rating - a.rating);

        if(trendingAnimes.length > 0) {
            setHeroAnimes(trendingAnimes.slice(0, 5));
        }

        const genres = ['Acción', 'Comedia', 'Drama', 'Fantasía', 'Sci-Fi'];

        const sectionsData: CarouselSection[] = [
          { title: 'Tendencias', animes: trendingAnimes.slice(0, 15) },
          { title: 'Agregados Recientemente', animes: allAnimes.slice(0, 15) },
        ];

        genres.forEach(genre => {
          const filtered = allAnimes.filter(a => a.genres.includes(genre));
          if (filtered.length > 0) {
            sectionsData.push({ title: genre, animes: filtered.slice(0, 15) });
          }
        });
        
        setSections(sectionsData);

      } catch (error) {
        console.error("Error fetching animes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, []);

  return (
    <div className="space-y-12">
      {loading ? (
        <Skeleton className="h-[50vh] w-full rounded-lg bg-muted/50" />
      ) : heroAnimes.length > 0 && (
         <Carousel
          plugins={[autoplayPlugin.current]}
          className="w-full"
          onMouseEnter={() => autoplayPlugin.current.stop()}
          onMouseLeave={() => autoplayPlugin.current.reset()}
        >
          <CarouselContent>
            {heroAnimes.map((heroAnime) => (
              <CarouselItem key={heroAnime.id}>
                <div className="relative h-[50vh] w-full flex items-end rounded-lg overflow-hidden p-8 text-white">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"/>
                  <img src={heroAnime.bannerImage} alt={heroAnime.title} className="absolute inset-0 w-full h-full object-cover"/>
                  <div className="relative z-20 max-w-2xl space-y-4">
                      <h1 className="text-4xl md:text-5xl font-bold font-headline glow-text drop-shadow-lg">{heroAnime.title}</h1>
                      <p className="text-lg text-white/80 line-clamp-3">{heroAnime.description}</p>
                      <Button asChild size="lg">
                          <Link href={`/anime/${heroAnime.id}`}>
                              <Clapperboard className="mr-2" />
                              Ver ahora
                          </Link>
                      </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
      
      <div className="space-y-16">
        {loading ? (
           Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48 bg-muted/50" />
                <div className="flex space-x-4">
                  {Array.from({ length: 6 }).map((_, j) => (
                     <Skeleton key={j} className="h-64 w-44 rounded-lg bg-muted/50" />
                  ))}
                </div>
             </div>
           ))
        ) : sections.length > 0 ? (
          sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h2 className="text-3xl font-bold font-headline glow-text text-primary-foreground">{section.title}</h2>
              <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                <CarouselContent className="-ml-4">
                  {section.animes.map(anime => (
                    <CarouselItem key={anime.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 2xl:basis-1/7 pl-4">
                      <AnimeCard anime={anime} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                 <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
                 <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
              </Carousel>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <p className="text-xl font-medium text-muted-foreground">No se encontraron animes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
