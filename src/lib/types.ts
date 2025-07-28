import type { User as FirebaseUser } from "firebase/auth";

export interface Anime {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  dataAiHint: string;
  genres: string[];
  year: number;
  rating: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  watchedAnimes: string[];
  role?: 'admin' | 'user';
}

export interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => void;
  refetchUserProfile: () => Promise<void>;
}
