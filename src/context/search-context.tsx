
"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { Anime } from "@/lib/types";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Anime[];
  allAnimes: Anime[];
  setAllAnimes: (animes: Anime[]) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [allAnimes, setAllAnimes] = useState<Anime[]>([]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const lowercasedQuery = searchQuery.toLowerCase();

    return allAnimes.filter(anime => {
      const titleMatch = anime.title.toLowerCase().includes(lowercasedQuery);
      const genreMatch = anime.genres.some(genre => genre.toLowerCase().includes(lowercasedQuery));
      const yearMatch = anime.year.toString().includes(lowercasedQuery);
      return titleMatch || genreMatch || yearMatch;
    });
  }, [searchQuery, allAnimes]);

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    allAnimes,
    setAllAnimes
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
