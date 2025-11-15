
"use client";

import { useState, useMemo } from 'react';
import type { Anime } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { Edit, Trash2, Loader2, Search, Star } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/lib/hooks/use-toast";
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

interface AnimeListProps {
  animes: Anime[];
}

export function AnimeList({ animes }: AnimeListProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAnimes = useMemo(() => {
    if (!searchTerm) {
      return animes;
    }
    return animes.filter(anime =>
      anime.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [animes, searchTerm]);

  const handleDelete = async (animeId: string, animeTitle: string) => {
    setIsDeleting(animeId);
    try {
      await deleteDoc(doc(db, 'animes', animeId));
      toast({
        title: "Contenido Eliminado",
        description: `"${animeTitle}" ha sido eliminado del catálogo.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error.message || "Ocurrió un error inesperado.",
      });
    }
    setIsDeleting(null);
  };

  const handleToggleFeatured = async (animeId: string, currentFeatured: boolean) => {
    setIsUpdating(animeId);
    try {
      await updateDoc(doc(db, 'animes', animeId), {
        featured: !currentFeatured
      });
      toast({
        title: currentFeatured ? "Removido de Destacados" : "Agregado a Destacados",
        description: currentFeatured 
          ? "El anime ha sido removido de la sección destacados." 
          : "El anime ha sido agregado a la sección destacados.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: error.message || "Ocurrió un error inesperado.",
      });
    }
    setIsUpdating(null);
  };

  return (
    <div className="space-y-4">
       <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por título..."
            className="pl-10 w-full md:w-1/3 bg-input border-0 focus:ring-accent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search for an anime"
          />
       </div>
      <div className="border rounded-lg">
        <Table>
          <TableCaption>Una lista de todo el contenido en tu catálogo.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Portada</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Temporadas</TableHead>
              <TableHead className="text-right w-[120px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAnimes.length > 0 ? (
              filteredAnimes.map((anime) => {
                const seasonsCount = anime.seasons?.length || 1;
                const languages = anime.seasons ? Array.from(new Set(anime.seasons.map(s => s.language))) : ['sub'];

                return (
                  <TableRow key={anime.id}>
                    <TableCell>
                      <Image
                        src={anime.coverImage}
                        alt={anime.title}
                        width={50}
                        height={75}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{anime.title}</TableCell>
                    <TableCell>{anime.year}</TableCell>
                    <TableCell>{anime.rating.toFixed(1)}</TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                            <Badge variant="outline">{seasonsCount} Temporada(s)</Badge>
                            <div className="flex gap-1">
                            {languages.map(lang => (
                                <Badge key={lang} variant="secondary">{lang.toUpperCase()}</Badge>
                            ))}
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant={anime.featured ? "default" : "ghost"} 
                          size="icon"
                          onClick={() => handleToggleFeatured(anime.id, anime.featured || false)}
                          disabled={isUpdating === anime.id}
                          title={anime.featured ? "Remover de Destacados" : "Agregar a Destacados"}
                        >
                          {isUpdating === anime.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Star className={`h-4 w-4 ${anime.featured ? 'fill-current' : ''}`} />
                          )}
                        </Button>
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/admin/edit/${anime.id}`}>
                              <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isDeleting === anime.id}>
                              {isDeleting === anime.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente
                                el anime <span className="font-bold">"{anime.title}"</span> de la base de datos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(anime.id, anime.title)}
                                disabled={!!isDeleting}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
               <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
