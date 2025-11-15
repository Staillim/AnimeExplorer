"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Anime } from '@/lib/types';
import AnimeCard from '@/components/anime-card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const animesCollection = collection(db, 'animes');
        const animeSnapshot = await getDocs(animesCollection);
        const allAnimes = animeSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Anime));

        if (query.trim()) {
          const lowercasedQuery = query.toLowerCase();
          const filtered = allAnimes.filter(anime => {
            const titleMatch = anime.title.toLowerCase().includes(lowercasedQuery);
            const genreMatch = anime.genres.some(genre => genre.toLowerCase().includes(lowercasedQuery));
            const yearMatch = anime.year.toString().includes(lowercasedQuery);
            return titleMatch || genreMatch || yearMatch;
          });
          setResults(filtered);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold font-headline glow-text text-primary-foreground">
          Resultados para: <span className="text-accent">{query}</span>
        </h1>
        {results.length > 0 && (
          <p className="text-muted-foreground">
            Se encontraron {results.length} resultado{results.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-x-4 gap-y-8">
          {results.map(anime => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-4">
          <p className="text-lg text-muted-foreground">
            No se encontraron resultados para tu búsqueda.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
