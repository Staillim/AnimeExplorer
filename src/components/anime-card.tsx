import Link from 'next/link';
import Image from 'next/image';
import type { Anime } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface AnimeCardProps {
  anime: Anime;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link href={`/anime/${anime.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="relative aspect-[2/3] w-full">
            <Image
              src={anime.coverImage}
              alt={`Cover of ${anime.title}`}
              data-ai-hint={anime.dataAiHint}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg leading-tight font-bold group-hover:text-primary transition-colors">
            {anime.title}
          </CardTitle>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-wrap gap-2 items-center">
          {anime.genres.slice(0, 2).map(genre => (
            <Badge key={genre} variant="secondary">{genre}</Badge>
          ))}
          <div className="flex items-center gap-1 text-sm text-amber-500 ml-auto">
            <Star className="w-4 h-4 fill-current"/>
            <span>{anime.rating}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
