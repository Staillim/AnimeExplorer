
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Anime } from '@/lib/types';
import AnimeCard from '@/components/anime-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Autoplay from "embla-carousel-autoplay";
import Image from 'next/image';
import { useSearch } from '@/context/search-context';

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

  const { searchResults, setAllAnimes, selectedGenres, showFeaturedOnly } = useSearch();

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const animesCollection = collection(db, 'animes');
        const animeSnapshot = await getDocs(animesCollection);
        const animes = animeSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Anime));
        
        setAllAnimes(animes);

        const trendingAnimes = [...animes].sort((a,b) => (b.views || 0) - (a.views || 0));
        if(trendingAnimes.length > 0) {
            setHeroAnimes(trendingAnimes.slice(0, 5));
        }

        const genresForSections = ['Acción', 'Comedia', 'Drama', 'Fantasía', 'Sci-Fi'];
        const sectionsData: CarouselSection[] = [];
        
        // Agregar sección de Destacados si hay animes con featured = true
        const featuredAnimes = animes.filter(a => a.featured);
        if (featuredAnimes.length > 0) {
          sectionsData.push({ title: 'Destacados', animes: featuredAnimes.slice(0, 15) });
        }
        
        sectionsData.push({ title: 'Tendencias', animes: trendingAnimes.slice(0, 15) });
        
        // Ordenar por fecha de creación (los más recientes primero)
        const recentAnimes = [...animes].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        sectionsData.push({ title: 'Agregados Recientemente', animes: recentAnimes.slice(0, 15) });
        
        genresForSections.forEach(genre => {
          const filtered = animes.filter(a => a.genres.includes(genre));
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
  }, [setAllAnimes]);

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Skeleton className="h-[30vh] w-full rounded-lg bg-muted/50" />
          <div className="space-y-16">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48 bg-muted/50" />
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:basis-1/8 gap-4">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <Skeleton key={j} className="h-56 rounded-lg bg-muted/50" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }

    if (selectedGenres.length > 0) {
      return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold font-headline glow-text text-primary-foreground">
                Géneros: <span className="text-accent">{selectedGenres.join(', ')}</span>
            </h2>
            {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-x-4 gap-y-8">
                    {searchResults.map(anime => (
                        <AnimeCard key={anime.id} anime={anime} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground text-lg py-16">
                    No se encontraron animes en los géneros seleccionados.
                </p>
            )}
        </div>
      );
    }

    if (showFeaturedOnly) {
      return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold font-headline glow-text text-primary-foreground">
                🔥 <span className="text-accent">Animes H</span>
            </h2>
            {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-x-4 gap-y-8">
                    {searchResults.map(anime => (
                        <AnimeCard key={anime.id} anime={anime} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground text-lg py-16">
                    No hay contenido destacado disponible.
                </p>
            )}
        </div>
      );
    }
    
    // Default content (carousels)
    return (
       <>
        {heroAnimes.length > 0 && (
            <Carousel
                plugins={[autoplayPlugin.current]}
                className="w-full"
                onMouseEnter={() => autoplayPlugin.current.stop()}
                onMouseLeave={() => autoplayPlugin.current.reset()}
            >
                <CarouselContent>
                {heroAnimes.map((heroAnime) => (
                    <CarouselItem key={heroAnime.id}>
                    <div className="relative h-[30vh] w-full flex items-end rounded-lg overflow-hidden p-4 md:p-8 text-white">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"/>
                        <Image 
                        src={heroAnime.bannerImage || heroAnime.coverImage} 
                        alt={heroAnime.title} 
                        fill
                        className="object-cover"
                        data-ai-hint={heroAnime.dataAiHint}
                        priority
                        />
                        <div className="relative z-20 max-w-2xl space-y-3">
                            <h1 className="text-3xl md:text-4xl font-bold font-headline glow-text drop-shadow-lg">{heroAnime.title}</h1>
                            <p className="text-sm md:text-base text-white/80 line-clamp-2">{heroAnime.description}</p>
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
          {sections.length > 0 ? (
            sections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h2 className="text-3xl font-bold font-headline glow-text text-primary-foreground">{section.title}</h2>
                <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                  <CarouselContent className="-ml-4">
                    {section.animes.map(anime => (
                      <CarouselItem key={anime.id} className="basis-1/3 sm:basis-1/3 md:basis-1/5 lg:basis-1/6 xl:basis-1/7 2xl:basis-1/8 pl-4">
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
      </>
    );
  };

  return (
    <div className="space-y-12">
      {renderContent()}
    </div>
  );
}
