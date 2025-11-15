
"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { Anime } from "@/lib/types";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGenres: string[];
  setSelectedGenres: (genres: string[]) => void;
  showFeaturedOnly: boolean;
  setShowFeaturedOnly: (show: boolean) => void;
  searchResults: Anime[];
  allAnimes: Anime[];
  setAllAnimes: (animes: Anime[]) => void;
  allGenres: string[];
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [allAnimes, setAllAnimes] = useState<Anime[]>([]);

  // Obtener todos los géneros únicos de los animes
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    allAnimes.forEach(anime => {
      anime.genres.forEach(genre => genres.add(genre));
    });
    return Array.from(genres).sort();
  }, [allAnimes]);

  const searchResults = useMemo(() => {
    let results = allAnimes;

    // Filtrar por query de búsqueda
    if (searchQuery.trim()) {
      const lowercasedQuery = searchQuery.toLowerCase();
      results = results.filter(anime => {
        const titleMatch = anime.title.toLowerCase().includes(lowercasedQuery);
        const genreMatch = anime.genres.some(genre => genre.toLowerCase().includes(lowercasedQuery));
        const yearMatch = anime.year.toString().includes(lowercasedQuery);
        return titleMatch || genreMatch || yearMatch;
      });
    }

    // Filtrar por géneros seleccionados
    if (selectedGenres.length > 0) {
      results = results.filter(anime => 
        selectedGenres.some(genre => anime.genres.includes(genre))
      );
    }

    // Filtrar por destacados
    if (showFeaturedOnly) {
      results = results.filter(anime => anime.featured === true);
    }

    return results;
  }, [searchQuery, allAnimes, selectedGenres, showFeaturedOnly]);

  const value = {
    searchQuery,
    setSearchQuery,
    selectedGenres,
    setSelectedGenres,
    showFeaturedOnly,
    setShowFeaturedOnly,
    searchResults,
    allAnimes,
    setAllAnimes,
    allGenres
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
