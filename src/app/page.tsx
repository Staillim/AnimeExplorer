
"use client";

import { useState, useMemo, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Anime } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AnimeCard from '@/components/anime-card';
import { Search, ListFilter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [genres, setGenres] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const animesCollection = collection(db, 'animes');
        const animeSnapshot = await getDocs(animesCollection);
        const animeList = animeSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Anime));
        setAnimes(animeList);
        
        const allGenres = ['All', ...Array.from(new Set(animeList.flatMap(anime => anime.genres)))];
        setGenres(allGenres);
      } catch (error) {
        console.error("Error fetching animes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, []);

  const filteredAnimes = useMemo(() => {
    return animes.filter(anime => {
      try {
        const matchesGenre = selectedGenre === 'All' || anime.genres.includes(selectedGenre);
        const matchesSearch = anime.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesGenre && matchesSearch;
      } catch(e) {
        console.error("Error filtering animes: ", e);
        return false;
      }
    });
  }, [searchTerm, selectedGenre, animes]);

  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Anime Explorer</h1>
        <p className="text-lg text-muted-foreground">Tu portal al universo del anime.</p>
      </header>
      
      <div className="p-4 bg-card rounded-lg shadow-md border border-border sticky top-20 z-40">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por título..."
              className="pl-10 bg-input border-0 focus:ring-accent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search for an anime"
            />
          </div>
          <div className="relative flex-1 md:max-w-xs">
            <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Select onValueChange={setSelectedGenre} defaultValue={selectedGenre}>
              <SelectTrigger className="pl-10 bg-input border-0 focus:ring-accent" aria-label="Filter by genre">
                <SelectValue placeholder="Filtrar por género" />
              </SelectTrigger>
              <SelectContent>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
          ))}
        </div>
      ) : filteredAnimes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {filteredAnimes.map(anime => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl font-medium text-muted-foreground">No se encontraron animes.</p>
          <p className="text-sm text-muted-foreground">Intenta ajustar tu búsqueda o filtros.</p>
        </div>
      )}
    </div>
  );
}
