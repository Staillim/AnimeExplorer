
"use client";

import { useState } from 'react';
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
import { Edit, Trash2 } from "lucide-react";
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
import { deleteAnimeAction } from '@/app/admin/actions';

interface AnimeListProps {
  animes: Anime[];
}

export function AnimeList({ animes }: AnimeListProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (animeId: string, animeTitle: string) => {
    setIsDeleting(animeId);
    const result = await deleteAnimeAction(animeId);
    if (result.success) {
      toast({
        title: "Contenido Eliminado",
        description: `"${animeTitle}" ha sido eliminado del catálogo.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: result.message,
      });
    }
    setIsDeleting(null);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableCaption>Una lista de todo el contenido en tu catálogo.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Portada</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Año</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="text-right w-[120px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animes.map((anime) => (
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
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
