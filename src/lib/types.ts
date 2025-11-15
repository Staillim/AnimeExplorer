
import type { User as FirebaseUser } from "firebase/auth";

export interface Chapter {
  title?: string;
  url: string;
}

export interface Season {
  type: 'season' | 'movie';
  title: string;
  language: 'sub' | 'latino';
  chapters: Chapter[];
  movieUrl?: string | null; // Only for type 'movie'
}

export interface Anime {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  bannerImage?: string; 
  dataAiHint: string;
  genres: string[];
  year: number;
  rating: number;
  views?: number;
  seasons: Season[];
  featured?: boolean;
  createdAt?: number; // Timestamp de creación
  updatedAt?: number; // Timestamp de última modificación
}

export interface Ad {
  id: string;
  url: string;
  occurrences?: number; // Número de veces que aparece durante la reproducción
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  watchedAnimes: string[];
  role?: 'admin' | 'user';
  watchProgress?: {
    [animeId: string]: {
      seasonIndex: number;
      chapterIndex: number;
    }
  };
}

export interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => void;
  refetchUserProfile: () => Promise<void>;
}
