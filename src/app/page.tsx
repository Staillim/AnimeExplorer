"use client";

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { animes } from '@/lib/data';
import AnimeCard from '@/components/anime-card';
import { Search, Filter } from 'lucide-react';

const genres = ['All', ...Array.from(new Set(animes.flatMap(anime => anime.genres)))];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const filteredAnimes = useMemo(() => {
    return animes.filter(anime => {
      const matchesGenre = selectedGenre === 'All' || anime.genres.includes(selectedGenre);
      const matchesSearch = anime.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesGenre && matchesSearch;
    });
  }, [searchTerm, selectedGenre]);

  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Anime Explorer</h1>
        <p className="text-lg text-muted-foreground">Your gateway to the world of anime.</p>
      </header>
      
      <div className="p-4 bg-card rounded-lg shadow-md border border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for an anime..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search for an anime"
            />
          </div>
          <div className="relative flex-1 md:max-w-xs">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Select onValueChange={setSelectedGenre} defaultValue={selectedGenre}>
              <SelectTrigger className="pl-10" aria-label="Filter by genre">
                <SelectValue placeholder="Filter by genre" />
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

      {filteredAnimes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAnimes.map(anime => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl font-medium text-muted-foreground">No anime found.</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
