
import Link from 'next/link';
import Image from 'next/image';
import type { Anime } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AnimeCardProps {
  anime: Anime;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  const languages = Array.from(new Set((anime.seasons || []).map(s => s.language)));

  // Simple hash function to generate a number from a string
  const stringToHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  const cardStyleIndex = stringToHash(anime.id) % 5;

  const cardStyles = [
    "[--card-gradient-start:hsl(257,80%,65%)] [--card-gradient-end:hsl(220,90%,70%)] [--card-glow:hsl(257,80%,75%)]",
    "[--card-gradient-start:hsl(180,80%,60%)] [--card-gradient-end:hsl(210,90%,70%)] [--card-glow:hsl(180,80%,70%)]",
    "[--card-gradient-start:hsl(330,80%,65%)] [--card-gradient-end:hsl(290,90%,70%)] [--card-glow:hsl(330,80%,75%)]",
    "[--card-gradient-start:hsl(45,90%,55%)] [--card-gradient-end:hsl(25,95%,65%)] [--card-glow:hsl(45,90%,65%)]",
    "[--card-gradient-start:hsl(120,70%,55%)] [--card-gradient-end:hsl(150,80%,65%)] [--card-glow:hsl(120,70%,65%)]",
  ];

  return (
    <Link href={`/anime/${anime.id}`} className="group relative block w-full h-full">
      {/* Orbs */}
      <div 
        className={cn(
          "absolute -inset-1 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-70 blur-lg animate-pulse",
          cardStyles[cardStyleIndex]
        )}
        style={{ background: 'radial-gradient(circle at 50% 50%, var(--card-gradient-start), var(--card-gradient-end))' }}
      />
      
      <div 
        className={cn(
            "relative w-full h-auto aspect-[2/3] rounded-xl overflow-hidden bg-background/80 text-white shadow-lg transition-all duration-300 ease-in-out",
            "group-hover:scale-105 group-hover:-rotate-1 group-hover:shadow-2xl group-hover:shadow-black/50"
        )}
      >
        {/* Shimmer Effect */}
        <div className="absolute inset-0 z-10 hidden h-full w-full overflow-hidden rounded-xl md:block">
            <div className="absolute -top-1/2 left-0 h-[200%] w-24 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:animate-shimmer" />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            {Array.from({ length: 15 }).map((_, i) => (
                <span
                    key={i}
                    className="absolute block h-1 w-1 rounded-full bg-[var(--card-glow)]"
                    style={{
                        animation: `particle-fade 2s ease-in-out infinite ${Math.random() * 2}s`,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                    }}
                />
            ))}
        </div>

        <Image
          src={anime.coverImage}
          alt={`Cover of ${anime.title}`}
          data-ai-hint={anime.dataAiHint}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-20">
          {languages.map(lang => (
            <Badge key={lang} variant="secondary" className="text-xs uppercase shadow-md backdrop-blur-sm">
              {lang}
            </Badge>
          ))}
        </div>
        
        <div className="absolute bottom-0 left-0 p-4 w-full z-20">
          <h3 className="text-lg font-bold text-white truncate opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            {anime.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
