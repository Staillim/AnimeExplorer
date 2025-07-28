import Image from 'next/image';
import { notFound } from 'next/navigation';
import { animes } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export async function generateStaticParams() {
  return animes.map((anime) => ({
    id: anime.id,
  }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
    const anime = animes.find((a) => a.id === params.id);
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


export default function AnimeDetailPage({ params }: { params: { id: string } }) {
  const anime = animes.find((a) => a.id === params.id);

  if (!anime) {
    notFound();
  }

  return (
    <div className="bg-card p-6 sm:p-8 rounded-xl shadow-lg border border-border">
       <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-xl">
            <Image
              src={anime.coverImage}
              alt={`Cover of ${anime.title}`}
              data-ai-hint={anime.dataAiHint}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold font-headline text-primary">{anime.title}</h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
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
            <h2 className="text-2xl font-semibold font-headline mb-2">Description</h2>
            <p className="text-foreground/80 leading-relaxed">{anime.description}</p>
          </div>

          <div className="pt-4">
            <Button asChild size="lg">
              <Link href="/">Back to Catalog</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
