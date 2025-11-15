
"use client";

import { useState, useEffect, useCallback, useMemo, useRef, useTransition } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Anime, Ad, Season } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { Star, Calendar, Tv, PlayCircle, Loader2, ChevronLeft, ChevronRight, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SecurityUnlockOverlay from '@/components/security-unlock-overlay';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import AnimeCard from '@/components/anime-card';


const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;

async function getAnime(id: string): Promise<Anime | null> {
    const docRef = doc(db, 'animes', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Anime;
    }
    return null;
}

async function getAds(): Promise<Ad[]> {
    const adsCollection = collection(db, 'ads');
    const adSnapshot = await getDocs(adsCollection);
    return adSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
}

async function getAllAnimes(): Promise<Anime[]> {
    const animesCollection = collection(db, 'animes');
    const animeSnapshot = await getDocs(animesCollection);
    return animeSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Anime));
}


export default function AnimeDetailPage() {
    const params = useParams();
    const animeId = Array.isArray(params.id) ? params.id[0] : params.id;
    const [, startTransition] = useTransition();
    
    const { user, userProfile, refetchUserProfile } = useAuth();
    
    const [anime, setAnime] = useState<Anime | null>(null);
    const [ads, setAds] = useState<Ad[]>([]);
    const [recommendedAnimes, setRecommendedAnimes] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);
    const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
    const [isPlayerLocked, setIsPlayerLocked] = useState(true);
    const [currentAdQueue, setCurrentAdQueue] = useState<Array<{ad: Ad, index: number}>>([]);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const adTimerRef = useRef<NodeJS.Timeout | null>(null);
    
    const selectedSeason = anime?.seasons[selectedSeasonIndex];
    const selectedChapter = selectedSeason?.chapters[selectedChapterIndex];
    const isMovie = useMemo(() => anime?.seasons?.[0]?.type === 'movie', [anime]);

    const randomAd = useMemo(() => {
        if (ads.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * ads.length);
        return ads[randomIndex];
    }, [ads]);

    // Generar la cola de anuncios basada en occurrences
    useEffect(() => {
        if (ads.length === 0) {
            setCurrentAdQueue([]);
            setIsPlayerLocked(false);
            return;
        }

        const queue: Array<{ad: Ad, index: number}> = [];
        ads.forEach((ad) => {
            const occurrences = ad.occurrences || 1;
            for (let i = 0; i < occurrences; i++) {
                queue.push({ ad, index: i + 1 });
            }
        });
        
        // Mezclar la cola usando una seed determinística basada en animeId
        // para asegurar consistencia entre servidor y cliente
        const seed = animeId ? animeId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : Date.now();
        const seededRandom = (index: number) => {
            const x = Math.sin(seed + index) * 10000;
            return x - Math.floor(x);
        };

        for (let i = queue.length - 1; i > 0; i--) {
            const j = Math.floor(seededRandom(i) * (i + 1));
            [queue[i], queue[j]] = [queue[j], queue[i]];
        }

        setCurrentAdQueue(queue);
        setCurrentAdIndex(0);
        setIsPlayerLocked(true);
    }, [ads, animeId]);

    const updateUserWatchHistory = useCallback(async (newSeasonIndex: number, newChapterIndex: number) => {
        if (!user || !animeId) return;

        const userDocRef = doc(db, "users", user.uid);
        const progressKey = `watchProgress.${animeId}`;

        try {
            await updateDoc(userDocRef, {
                [progressKey]: {
                  seasonIndex: newSeasonIndex,
                  chapterIndex: newChapterIndex
                }
            });
            await refetchUserProfile();
        } catch (error) {
            console.error("Error updating watch history:", error);
        }
    }, [user, animeId, refetchUserProfile]);


    useEffect(() => {
        if (!animeId) {
            setLoading(false);
            notFound();
            return;
        }

        Promise.all([
            getAnime(animeId),
            getAds(),
            getAllAnimes()
        ]).then(([animeData, adsData, allAnimes]) => {
            if (animeData) {
                setAnime(animeData);
                setAds(adsData);

                // Set recommended animes
                const recommendations = allAnimes.filter(a => 
                    a.id !== animeData.id && a.genres.some(g => animeData.genres.includes(g))
                ).slice(0, 15);
                setRecommendedAnimes(recommendations);
                
                if (userProfile?.watchProgress && userProfile.watchProgress[animeId] !== undefined) {
                    const { seasonIndex: lastSeason, chapterIndex: lastChapter } = userProfile.watchProgress[animeId];
                    if(lastSeason < animeData.seasons.length && lastChapter < animeData.seasons[lastSeason].chapters.length) {
                       setSelectedSeasonIndex(lastSeason);
                       setSelectedChapterIndex(lastChapter);
                    }
                }
            } else {
                notFound();
            }
        }).catch(err => {
            console.error("Error fetching page data:", err);
            notFound();
        }).finally(() => {
            setLoading(false);
        });
    }, [animeId, userProfile]);

    const cleanupAdTimer = () => {
        if (adTimerRef.current) {
            clearTimeout(adTimerRef.current);
            adTimerRef.current = null;
        }
    };

    useEffect(() => {
        // Cleanup timer on component unmount or when dependencies change
        return () => {
            cleanupAdTimer();
        };
    }, []);

    useEffect(() => {
        // If content changes, reset ad queue and lock player
        cleanupAdTimer();
        setCurrentAdIndex(0);
        setIsPlayerLocked(true);
    }, [selectedSeasonIndex, selectedChapterIndex]);

    const handleAdComplete = () => {
        // Si hay más anuncios en la cola, mostrar el siguiente
        if (currentAdIndex < currentAdQueue.length - 1) {
            startTransition(() => {
                setCurrentAdIndex(currentAdIndex + 1);
            });
            // El overlay se mostrará automáticamente con el siguiente anuncio
        } else {
            // Si no hay más anuncios, desbloquear el reproductor
            startTransition(() => {
                setIsPlayerLocked(false);
            });
            if (isMovie) {
                // Si es una película, empezar el temporizador de 15 minutos para re-bloquear
                adTimerRef.current = setTimeout(() => {
                    startTransition(() => {
                        setIsPlayerLocked(true);
                        setCurrentAdIndex(0);
                    });
                }, FIFTEEN_MINUTES_IN_MS);
            }
        }
    };

    const handleChapterSelect = (chapterIndex: number) => {
        if (selectedSeason && chapterIndex >= 0 && chapterIndex < selectedSeason.chapters.length) {
            setSelectedChapterIndex(chapterIndex);
            if (user) {
                updateUserWatchHistory(selectedSeasonIndex, chapterIndex);
            }
        }
    };

    const handleSeasonSelect = (seasonIndex: number) => {
      setSelectedSeasonIndex(seasonIndex);
      setSelectedChapterIndex(0);
      if (user) {
        updateUserWatchHistory(seasonIndex, 0);
      }
    };
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    if (!anime) {
        return notFound();
    }
    
    return (
        <div className="w-full space-y-12">
             <div className="relative w-full h-[30vh] rounded-lg overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src={anime.bannerImage || anime.coverImage}
                        alt={`Banner for ${anime.title}`}
                        data-ai-hint={anime.dataAiHint}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                </div>
                <div className="relative h-full flex flex-row items-end pb-8 gap-6 p-4 md:p-8">
                    <div className="w-1/3 sm:w-1/4 md:w-1/5 lg:w-[15%] flex-shrink-0">
                        <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-2xl shadow-black/50 border-4 border-card/50">
                            <Image
                                src={anime.coverImage}
                                alt={`Cover of ${anime.title}`}
                                data-ai-hint={anime.dataAiHint}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <div className="w-2/3 sm:w-3/4 md:w-4/5 lg:w-[85%] space-y-2 md:space-y-3">
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold font-headline glow-text text-primary-foreground drop-shadow-lg">{anime.title}</h1>
                        <div className="flex items-center flex-wrap gap-x-2 md:gap-x-4 gap-y-2 text-muted-foreground">
                            <div className="flex items-center gap-1.5 text-amber-400">
                                <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                                <span className="font-bold text-sm md:text-lg">{anime.rating}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {isMovie ? <Film className="w-3 h-3 md:w-4 md:h-4" /> : <Tv className="w-3 h-3 md:w-4 md:h-4" />}
                                <span className="text-xs md:text-base">
                                  {isMovie ? 'Película' : `${anime.seasons.length} Temporada(s)`}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="text-xs md:text-base">{anime.year}</span>
                            </div>
                        </div>
                        <p className="text-foreground/80 leading-relaxed max-w-3xl line-clamp-2 md:line-clamp-3 text-xs sm:text-sm md:text-base">{anime.description}</p>
                        <p className="text-sm text-muted-foreground pt-1">
                          <span className="font-semibold text-foreground/90">Géneros: </span>
                          {anime.genres.join(', ')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Reproductor y Lista de Capítulos */}
            {selectedChapter && selectedSeason && (
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                           <h2 className="text-2xl font-bold font-headline glow-text text-primary">
                                {isMovie ? `Viendo: ${anime.title}` : `Viendo: ${selectedSeason.title}`}
                           </h2>
                           {!isMovie && anime.seasons.length > 1 && (
                              <Select onValueChange={(value) => handleSeasonSelect(Number(value))} value={String(selectedSeasonIndex)}>
                                <SelectTrigger className="w-full md:w-[280px]">
                                  <SelectValue placeholder="Seleccionar temporada" />
                                </SelectTrigger>
                                <SelectContent>
                                  {anime.seasons.map((season, index) => (
                                    <SelectItem key={index} value={String(index)}>
                                      {season.title} ({season.language.toUpperCase()})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                           )}
                        </div>
                        <div className="p-1 md:p-2 bg-black/50 rounded-lg ring-2 ring-primary/30 shadow-2xl shadow-primary/20">
                            <div className="relative aspect-video rounded-md overflow-hidden">
                               { isPlayerLocked && currentAdQueue.length > 0 && currentAdIndex < currentAdQueue.length && (
                                    <SecurityUnlockOverlay 
                                        key={`${currentAdIndex}-${currentAdQueue[currentAdIndex].ad.id}`}
                                        adUrl={currentAdQueue[currentAdIndex].ad.url} 
                                        onComplete={handleAdComplete}
                                        viewTimeSeconds={5}
                                        unlockTimerSeconds={3}
                                        adNumber={currentAdIndex + 1}
                                        totalAds={currentAdQueue.length}
                                    />
                               )}
                               <iframe
                                    key={selectedChapter.url}
                                    src={selectedChapter.url}
                                    title={selectedChapter.title || `Capítulo ${selectedChapterIndex + 1}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    webkitallowfullscreen="true"
                                    mozallowfullscreen="true"
                                    className="w-full h-full"
                                ></iframe>
                            </div>
                        </div>
                    </div>

                    {/* Navegador de Capítulos */}
                     {!isMovie && selectedSeason.chapters.length > 1 && (
                        <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-card/50 border border-border">
                            <Button 
                                variant="outline" 
                                size="lg" 
                                onClick={() => handleChapterSelect(selectedChapterIndex - 1)}
                                disabled={selectedChapterIndex === 0}
                                aria-label="Capítulo anterior"
                            >
                                <ChevronLeft className="h-5 w-5" />
                                <span className="ml-2 hidden sm:inline">Anterior</span>
                            </Button>
                            
                            <div className="text-center overflow-hidden">
                                <p className="text-sm text-muted-foreground">Estás viendo</p>
                                <h3 className="text-lg font-bold text-primary-foreground truncate">
                                    {selectedChapter.title || `Capítulo ${selectedChapterIndex + 1}`}
                                </h3>
                            </div>

                            <Button 
                                variant="outline" 
                                size="lg"
                                onClick={() => handleChapterSelect(selectedChapterIndex + 1)}
                                disabled={selectedChapterIndex === selectedSeason.chapters.length - 1}
                                aria-label="Siguiente capítulo"
                            >
                               <span className="mr-2 hidden sm:inline">Siguiente</span>
                               <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                     )}
                </div>
            )}
            
             {/* Recommended Animes */}
            {recommendedAnimes.length > 0 && (
                <div className="space-y-8">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold font-headline glow-text text-primary-foreground">Recomendados</h2>
                      <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                        <CarouselContent className="-ml-4">
                          {recommendedAnimes.map(recAnime => (
                            <CarouselItem key={recAnime.id} className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/7 2xl:basis-1/8 pl-4">
                              <AnimeCard anime={recAnime} />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                         <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
                         <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
                      </Carousel>
                    </div>
                </div>
            )}

            <div className="pt-8 pb-8 text-center">
                <Button asChild size="lg" variant="outline">
                    <Link href="/">Volver al Catálogo</Link>
                </Button>
            </div>
        </div>
    );
}

    
