import Image from 'next/image';
import { notFound } from 'next/navigation';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Anime } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Tv, PlayCircle, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <div className="w-full">
      <div className="relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
        <Image
          src={anime.bannerImage || anime.coverImage}
          alt={`Banner of ${anime.title}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-12 gap-8 -mt-32 md:-mt-48">
          <div className="md:col-span-4 lg:col-span-3 z-10">
            <div className="relative aspect-[2/3] w-full max-w-sm mx-auto rounded-lg overflow-hidden shadow-2xl shadow-black/50 border-4 border-card/50">
              <Image
                src={anime.coverImage}
                alt={`Cover of ${anime.title}`}
                data-ai-hint={anime.dataAiHint}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-8 lg:col-span-9 space-y-6 pt-0 md:pt-52">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold font-headline text-primary-foreground drop-shadow-lg">{anime.title}</h1>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Tv className="w-4 h-4" />
                  <span>{anime.season}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{anime.year}</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-bold text-lg">{anime.rating}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {anime.genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="text-sm">{genre}</Badge>
              ))}
            </div>

            <div>
              <h2 className="text-2xl font-semibold font-headline mb-2">Descripción</h2>
              <p className="text-foreground/80 leading-relaxed max-w-3xl">{anime.description}</p>
            </div>
          </div>
        </div>

        <div className="mt-12">
           <h2 className="text-3xl font-bold font-headline mb-4">Capítulos</h2>
          {anime.chapters && anime.chapters.length > 0 ? (
            <Card className="bg-card/50 border-border/50">
              <ScrollArea className="h-[400px]">
                <CardContent className="p-4 space-y-2">
                  {anime.chapters.map((chapter, index) => (
                    <Link 
                      href={`/play/${anime.id}/${index}`}
                      key={index}
                      className="flex items-center p-3 rounded-lg hover:bg-secondary transition-colors group"
                    >
                      <PlayCircle className="w-10 h-10 text-primary/50 group-hover:text-primary transition-colors"/>
                      <div className="ml-4">
                        <p className="font-semibold text-lg text-foreground group-hover:text-primary-foreground transition-colors">
                           {chapter.title || `Capítulo ${index + 1}`}
                        </p>
                         <span className="text-sm text-muted-foreground">Reproducir ahora</span>
                      </div>
                      <LinkIcon className="ml-auto w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors"/>
                    </Link>
                  ))}
                </CardContent>
              </ScrollArea>
            </Card>
          ) : (
             <Card className="bg-card/50 border-border/50">
                <CardContent className="p-16 text-center">
                    <p className="text-muted-foreground">No hay capítulos disponibles por el momento.</p>
                </CardContent>
            </Card>
          )}
        </div>
        
        <div className="pt-12 pb-8 text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/">Volver al Catálogo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
