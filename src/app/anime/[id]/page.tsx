import Image from 'next/image';
import { notFound } from 'next/navigation';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Anime } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Tv, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export async function generateStaticParams() {
  try {
    const animesCollection = collection(db, 'animes');
    const animeSnapshot = await getDocs(animesCollection);
    const animes = animeSnapshot.docs.map(doc => ({ id: doc.id }));
    return animes;
  } catch (error) {
    console.error("Failed to generate static params, returning empty array.", error)
    return [];
  }
}

async function getAnime(id: string): Promise<Anime | null> {
    const docRef = doc(db, 'animes', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Anime;
    } else {
        return null;
    }
}


export async function generateMetadata({ params }: { params: { id: string } }) {
    const anime = await getAnime(params.id);
    if (!anime) {
        return {
            title: 'Anime Not Found'
        }
    }
    return {
        title: `${anime.title} | Anime Explorer`,
        description: anime.description,
    }
}


export default async function AnimeDetailPage({ params }: { params: { id: string } }) {
  const anime = await getAnime(params.id);

  if (!anime) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {anime.bannerImage && (
         <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={anime.bannerImage}
              alt={`Banner of ${anime.title}`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
         </div>
      )}
      
      <div className="grid md:grid-cols-3 gap-8 -mt-16 md:-mt-24 px-4">
        <div className="md:col-span-1 z-10">
          <div className="relative aspect-[2/3] w-full max-w-sm mx-auto rounded-lg overflow-hidden shadow-2xl border-4 border-card">
            <Image
              src={anime.coverImage}
              alt={`Cover of ${anime.title}`}
              data-ai-hint={anime.dataAiHint}
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="md:col-span-2 space-y-6 pt-0 md:pt-28">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold font-headline text-primary">{anime.title}</h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
               <div className="flex items-center gap-1.5">
                <Tv className="w-4 h-4" />
                <span>{anime.season}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{anime.year}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-bold text-lg">{anime.rating}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {anime.genres.map((genre) => (
              <Badge key={genre} variant="default" className="text-sm">{genre}</Badge>
            ))}
          </div>

          <div>
            <h2 className="text-2xl font-semibold font-headline mb-2">Descripción</h2>
            <p className="text-foreground/80 leading-relaxed">{anime.description}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Capítulos</CardTitle>
        </CardHeader>
        <CardContent>
          {anime.chapters && anime.chapters.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {anime.chapters.map((chapter, index) => (
                <Button asChild key={index} variant="outline" className="justify-start">
                  <a href={chapter.url} target="_blank" rel="noopener noreferrer">
                    <LinkIcon className="mr-2"/>
                    {chapter.title || `Capítulo ${index + 1}`}
                  </a>
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No hay capítulos disponibles.</p>
          )}
        </CardContent>
      </Card>
      
      <div className="pt-4 text-center">
        <Button asChild size="lg">
          <Link href="/">Volver al Catálogo</Link>
        </Button>
      </div>
    </div>
  );
}
