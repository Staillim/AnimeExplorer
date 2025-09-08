
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Anime } from '@/lib/types';
import AnimeCard from '@/components/anime-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Clapperboard, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Autoplay from "embla-carousel-autoplay";
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';


interface CarouselSection {
  title: string;
  animes: Anime[];
}

export default function Home() {
  const [allAnimes, setAllAnimes] = useState<Anime[]>([]);
  const [sections, setSections] = useState<CarouselSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroAnimes, setHeroAnimes] = useState<Anime[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [filteredAnimes, setFilteredAnimes] = useState<Anime[]>([]);

  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const animesCollection = collection(db, 'animes');
        const allDocsQuery = query(animesCollection, orderBy('year', 'desc'));
        const animeSnapshot = await getDocs(allDocsQuery);
        const animes = animeSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Anime));
        
        setAllAnimes(animes);

        const trendingAnimes = [...animes].sort((a,b) => (b.views || 0) - (a.views || 0));
        if(trendingAnimes.length > 0) {
            setHeroAnimes(trendingAnimes.slice(0, 5));
        }

        const genresForSections = ['Acción', 'Comedia', 'Drama', 'Fantasía', 'Sci-Fi'];
        const sectionsData: CarouselSection[] = [
          { title: 'Tendencias', animes: trendingAnimes.slice(0, 15) },
          { title: 'Agregados Recientemente', animes: animes.slice(0, 15) },
        ];
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
  }, []);

  const genres = useMemo(() => {
    const allGenres = allAnimes.flatMap(anime => anime.genres);
    return [...new Set(allGenres)].sort();
  }, [allAnimes]);
  
  const years = useMemo(() => {
    const allYears = allAnimes.map(anime => anime.year);
    return [...new Set(allYears)].sort((a, b) => b - a);
  }, [allAnimes]);

  const isFiltering = searchTerm || selectedGenre || selectedYear;

  useEffect(() => {
    if (!isFiltering) {
      setFilteredAnimes([]);
      return;
    }
    const filtered = allAnimes.filter(anime => {
      const matchName = searchTerm ? anime.title.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      const matchGenre = selectedGenre ? anime.genres.includes(selectedGenre) : true;
      const matchYear = selectedYear ? anime.year === parseInt(selectedYear) : true;
      return matchName && matchGenre && matchYear;
    });
    setFilteredAnimes(filtered);
  }, [searchTerm, selectedGenre, selectedYear, allAnimes, isFiltering]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSelectedYear('');
  };


  return (
    <div className="space-y-12">
      {loading ? (
        <Skeleton className="h-[30vh] w-full rounded-lg bg-muted/50" />
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

      {/* Filter Section */}
       {!loading && (
        <Card className="bg-card/70 backdrop-blur-lg">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div className="sm:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-muted-foreground mb-2">Buscar por nombre</label>
                <Input
                  id="search"
                  placeholder="Ej: Attack on Titan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-muted-foreground mb-2">Género</label>
                 <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                    <SelectTrigger id="genre">
                        <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Todos</SelectItem>
                        {genres.map(genre => <SelectItem key={genre} value={genre}>{genre}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
              <div>
                 <label htmlFor="year" className="block text-sm font-medium text-muted-foreground mb-2">Año</label>
                 <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger id="year">
                        <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Todos</SelectItem>
                        {years.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-16">
        {loading ? (
           Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48 bg-muted/50" />
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
                  {Array.from({ length: 7 }).map((_, j) => (
                     <Skeleton key={j} className="h-64 rounded-lg bg-muted/50" />
                  ))}
                </div>
             </div>
           ))
        ) : isFiltering ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold font-headline glow-text text-primary-foreground">
                Resultados del Filtro ({filteredAnimes.length})
              </h2>
              <Button variant="ghost" onClick={clearFilters}>
                <FilterX className="mr-2 h-4 w-4" />
                Limpiar Filtros
              </Button>
            </div>
            {filteredAnimes.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
                {filteredAnimes.map(anime => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl font-medium text-muted-foreground">No se encontraron resultados para tu búsqueda.</p>
              </div>
            )}
          </div>
        ) : sections.length > 0 ? (
          sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h2 className="text-3xl font-bold font-headline glow-text text-primary-foreground">{section.title}</h2>
              <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                <CarouselContent className="-ml-4">
                  {section.animes.map(anime => (
                    <CarouselItem key={anime.id} className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/7 2xl:basis-1/8 pl-4">
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

