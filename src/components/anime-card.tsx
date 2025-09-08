
import Link from 'next/link';
import Image from 'next/image';
import type { Anime, Season } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnimeCardProps {
  anime: Anime;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  // Get unique languages available for the anime, ensuring seasons exist.
  const languages = Array.from(new Set((anime.seasons || []).map(s => s.language)));

  return (
    <Link href={`/anime/${anime.id}`} className="group block">
      <Card className="relative h-auto aspect-[2/3] overflow-hidden rounded-lg transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-primary/20 border-0 bg-card">
        <Image
          src={anime.coverImage}
          alt={`Cover of ${anime.title}`}
          data-ai-hint={anime.dataAiHint}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          {languages.map(lang => (
            <Badge key={lang} variant="secondary" className="text-xs uppercase shadow-md backdrop-blur-sm">
              {lang}
            </Badge>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 p-3 w-full">
          <h3 className="text-md font-bold text-white truncate opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            {anime.title}
          </h3>
        </div>
      </Card>
    </Link>
  );
}
