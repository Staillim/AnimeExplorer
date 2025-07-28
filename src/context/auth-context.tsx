
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AuthContextType, UserProfile } from "@/lib/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function setSessionCookie(idToken: string) {
  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
}

async function clearSessionCookie() {
  await fetch('/api/auth/session', { method: 'DELETE' });
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (firebaseUser: User) => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      setUserProfile(userDocSnap.data() as UserProfile);
    } else {
      // Create a profile if it doesn't exist (e.g., for Google Sign-In)
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'New User',
        watchedAnimes: [],
        role: 'user', // Default role
        watchProgress: {},
      };
      await setDoc(userDocRef, newProfile);
      setUserProfile(newProfile);
    }
  }, []);

  const refetchUserProfile = useCallback(async () => {
    if (user) {
      setLoading(true);
      await fetchUserProfile(user);
      setLoading(false);
    }
  }, [user, fetchUserProfile]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserProfile(firebaseUser);
        const idToken = await firebaseUser.getIdToken();
        await setSessionCookie(idToken);
      } else {
        setUser(null);
        setUserProfile(null);
        await clearSessionCookie();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  const logout = async () => {
    await signOut(auth);
  };

  const value = { user, userProfile, loading, logout, refetchUserProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
