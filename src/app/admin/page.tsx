
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { AddAnimeForm } from '@/components/admin/add-anime-form';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (userProfile?.role === 'admin') {
        setIsAuthorized(true);
      } else {
        router.push('/');
      }
    }
  }, [userProfile, loading, router]);

  if (loading || !isAuthorized) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">Admin Panel</h1>
        <p className="text-lg text-muted-foreground">Manage the anime catalog.</p>
      </header>
      <div className="max-w-2xl mx-auto">
        <AddAnimeForm />
      </div>
    </div>
  );
}
