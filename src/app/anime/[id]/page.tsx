
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Anime, Ad } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Tv, PlayCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getDecryptedUrl } from './actions';
import PlayerAdOverlay from '@/components/player-ad-overlay';

const AD_INTERVAL_MINUTES = 15;

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

export default function AnimeDetailPage() {
    const params = useParams();
    const animeId = Array.isArray(params.id) ? params.id[0] : params.id;
    
    const { user, userProfile, refetchUserProfile } = useAuth();
    
    const [anime, setAnime] = useState<Anime | null>(null);
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
    const [decryptedUrl, setDecryptedUrl] = useState('');
    const [isPlayerLocked, setIsPlayerLocked] = useState(true);
    const [isMovie, setIsMovie] = useState(false);

    const updateUserWatchHistory = useCallback(async (newChapterIndex: number) => {
        if (!user || !animeId) return;

        const userDocRef = doc(db, "users", user.uid);
        const progressKey = `watchProgress.${animeId}`;

        try {
            await updateDoc(userDocRef, {
                [progressKey]: newChapterIndex
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

        Promise.all([getAnime(animeId), getAds()]).then(([animeData, adData]) => {
            if (animeData) {
                setAnime(animeData);
                setAds(adData);
                setIsMovie(animeData.chapters.length === 1 && (animeData.season.toLowerCase().includes('película') || animeData.season.toLowerCase().includes('movie')));

                const lastWatchedIndex = userProfile?.watchProgress?.[animeId];
                if (lastWatchedIndex !== undefined && lastWatchedIndex < animeData.chapters.length) {
                    setSelectedChapterIndex(lastWatchedIndex);
                } else {
                    setSelectedChapterIndex(0);
                }
            } else {
                notFound();
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [animeId, userProfile]);

    useEffect(() => {
        if (anime && anime.chapters[selectedChapterIndex]) {
            setIsPlayerLocked(true); // Lock player on chapter change
            setDecryptedUrl(''); // Clear previous URL
            getDecryptedUrl(anime.chapters[selectedChapterIndex].url)
                .then(url => {
                    setDecryptedUrl(url)
                });
        }
    }, [anime, selectedChapterIndex]);

    // Ad timer for movies
    useEffect(() => {
        if (!isMovie || isPlayerLocked) return;

        const interval = setInterval(() => {
            setIsPlayerLocked(true);
        }, AD_INTERVAL_MINUTES * 60 * 1000);

        return () => clearInterval(interval);
    }, [isMovie, isPlayerLocked]);

    const handleChapterSelect = (index: number) => {
        setSelectedChapterIndex(index);
        updateUserWatchHistory(index);
    };

    const handleAdCompleted = () => {
        setIsPlayerLocked(false);
    };

    const randomAd = useMemo(() => {
        if (ads.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * ads.length);
        return ads[randomIndex];
    }, [ads, isPlayerLocked]); // Re-calculate when lock state changes

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
    
    const selectedChapter = anime.chapters[selectedChapterIndex];

    return (
        <div className="w-full space-y-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="grid md:grid-cols-12 gap-8">
                    {/* Columna de Portada */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <div className="relative aspect-[2/3] w-full max-w-xs mx-auto rounded-lg overflow-hidden shadow-2xl shadow-black/50 border-4 border-card/50">
                            <Image
                                src={anime.coverImage}
                                alt={`Cover of ${anime.title}`}
                                data-ai-hint={anime.dataAiHint}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                    {/* Columna de Información */}
                    <div className="md:col-span-8 lg:col-span-9 space-y-6">
                        <div className="space-y-4">
                            <h1 className="text-4xl lg:text-5xl font-bold font-headline text-primary-foreground drop-shadow-lg">{anime.title}</h1>
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
                                <div className="flex items-center gap-1.5 text-amber-400">
                                    <Star className="w-5 h-5 fill-current" />
                                    <span className="font-bold text-lg">{anime.rating}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Tv className="w-4 h-4" />
                                    <span>{anime.season}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    <span>{anime.year}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-foreground/80 leading-relaxed max-w-3xl">{anime.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {anime.genres.map((genre) => (
                                <Badge key={genre} variant="secondary" className="text-sm">{genre}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reproductor y Lista de Capítulos */}
            {anime.chapters && anime.chapters.length > 0 && selectedChapter && (
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Reproductor de Video */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold font-headline text-primary">
                            Viendo: {selectedChapter.title || `Capítulo ${selectedChapterIndex + 1}`}
                        </h2>
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl shadow-black/50">
                           {isPlayerLocked && randomAd ? (
                             <PlayerAdOverlay adUrl={randomAd.url} onComplete={handleAdCompleted} />
                           ) : (
                             decryptedUrl ? (
                               <iframe
                                   key={decryptedUrl}
                                   src={decryptedUrl}
                                   title={selectedChapter.title || `Capítulo ${selectedChapterIndex + 1}`}
                                   frameBorder="0"
                                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                   allowFullScreen
                                   className="w-full h-full"
                               ></iframe>
                             ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                </div>
                             )
                           )}
                        </div>
                    </div>

                    {/* Lista de Capítulos */}
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold font-headline">Capítulos</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {anime.chapters.map((chapter, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleChapterSelect(index)}
                                    className={`flex items-center p-3 rounded-lg hover:bg-secondary transition-colors group text-left w-full ${selectedChapterIndex === index ? 'bg-primary/20 ring-2 ring-primary' : 'bg-card/50'}`}
                                >
                                    <PlayCircle className={`w-10 h-10 transition-colors ${selectedChapterIndex === index ? 'text-primary' : 'text-primary/50 group-hover:text-primary'}`}/>
                                    <div className="ml-4 overflow-hidden">
                                        <p className={`font-semibold text-lg truncate transition-colors ${selectedChapterIndex === index ? 'text-primary-foreground' : 'text-foreground group-hover:text-primary-foreground'}`}>
                                            {chapter.title || `Capítulo ${index + 1}`}
                                        </p>
                                        <span className="text-sm text-muted-foreground">Reproducir ahora</span>
                                    </div>
                                </button>
                            ))}
                        </div>
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
