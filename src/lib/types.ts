
import type { User as FirebaseUser } from "firebase/auth";

export interface Chapter {
  title?: string;
  url: string;
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
  season: string;
  chapters: Chapter[];
}

export interface Ad {
  id: string;
  url: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  watchedAnimes: string[];
  role?: 'admin' | 'user';
  watchProgress?: {
    [animeId: string]: number; // chapterIndex
  };
}

export interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => void;
  refetchUserProfile: () => Promise<void>;
}
