import { notFound } from 'next/navigation';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Anime } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';

async function getAnime(id: string): Promise<Anime | null> {
    const docRef = doc(db, 'animes', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Anime;
    } else {
        return null;
    }
}

export async function generateMetadata({ params }: { params: { animeId: string, chapterIndex: string } }) {
    const anime = await getAnime(params.animeId);
    const chapterIndex = parseInt(params.chapterIndex, 10);

    if (!anime || !anime.chapters[chapterIndex]) {
        return {
            title: 'Capítulo no encontrado'
        }
    }
    const chapter = anime.chapters[chapterIndex];
    return {
        title: `Viendo: ${chapter.title || `Capítulo ${chapterIndex + 1}`} - ${anime.title}`,
    }
}


export default async function PlayerPage({ params }: { params: { animeId: string, chapterIndex: string } }) {
  const { animeId, chapterIndex: chapterIndexStr } = params;
  const chapterIndex = parseInt(chapterIndexStr, 10);

  const anime = await getAnime(animeId);

  if (!anime || isNaN(chapterIndex) || chapterIndex < 0 || chapterIndex >= anime.chapters.length) {
    notFound();
  }

  const chapter = anime.chapters[chapterIndex];
  const hasNext = chapterIndex < anime.chapters.length - 1;
  const hasPrev = chapterIndex > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] w-full">
      <header className="flex-shrink-0 mb-4">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <Link href={`/anime/${anime.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
              <h2 className="text-2xl font-bold">{anime.title}</h2>
            </Link>
            <h1 className="text-xl text-primary">{chapter.title || `Capítulo ${chapterIndex + 1}`}</h1>
          </div>
          <div className="flex items-center gap-2">
             <Button asChild variant="outline" size="icon">
                <Link href="/">
                    <Home className="h-4 w-4"/>
                    <span className="sr-only">Volver al catálogo</span>
                </Link>
            </Button>
            <Button asChild variant="outline" disabled={!hasPrev}>
                <Link href={hasPrev ? `/play/${animeId}/${chapterIndex - 1}` : '#'}>
                    <ChevronLeft className="mr-2 h-4 w-4"/>
                    Anterior
                </Link>
            </Button>
             <Button asChild variant="default" disabled={!hasNext}>
                <Link href={hasNext ? `/play/${animeId}/${chapterIndex + 1}` : '#'}>
                    Siguiente
                    <ChevronRight className="ml-2 h-4 w-4"/>
                </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow bg-black rounded-lg overflow-hidden">
        <video
            src={chapter.url}
            controls
            autoPlay
            className="w-full h-full object-contain"
        >
            Tu navegador no soporta el tag de video.
        </video>
      </main>
    </div>
  );
}
