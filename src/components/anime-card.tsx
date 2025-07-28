import Link from 'next/link';
import Image from 'next/image';
import type { Anime } from '@/lib/types';
import { Card } from '@/components/ui/card';

interface AnimeCardProps {
  anime: Anime;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link href={`/anime/${anime.id}`} className="group block">
      <Card className="relative h-auto aspect-[2/3] overflow-hidden rounded-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 border-0">
        <Image
          src={anime.coverImage}
          alt={`Cover of ${anime.title}`}
          data-ai-hint={anime.dataAiHint}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <h3 className="text-lg font-bold text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            {anime.title}
          </h3>
        </div>
      </Card>
    </Link>
  );
}